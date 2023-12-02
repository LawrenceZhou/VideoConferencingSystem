/* global Twilio Runtime */
'use strict';

const operateAParticipantSubscription = async function(context, room_sid, subscriber, subscribed_who, operation) {
  const client = context.getTwilioClient();
  try {
      let newRules;
      let action;
      let opposite;
      if(operation === "enable"){
        action = "include";
        opposite = "exclude";
      }else{
        action = "exclude";
        opposite = "include";
      }
      client.video.rooms(room_sid).participants.get(subscriber)
        .subscribeRules.fetch()
        .then(subscribeRules => {
          let rules = subscribeRules.rules;
          console.log('old rules: ', rules);
          if(Array.isArray(rules)){
         
            rules = rules.filter((rule)=> JSON.parse(JSON.stringify(rule.publisher))!==JSON.parse(JSON.stringify(subscribed_who))  );
            console.log("delete all audio rules about ", subscribed_who, rules);
              newRules = rules.concat({type:action, kind:'audio', publisher:subscribed_who});
          }else {
            console.log("no rule");

              newRules=[{type:action, kind:'audio', publisher:subscribed_who}];
          }
          
    console.log('new rules: ', newRules);
    const subscribeRulesResponse =  client.video.rooms(room_sid).participants( subscriber ).subscribeRules.update({ rules: newRules });
    console.log(subscribeRulesResponse);
         
        })
      .catch(error => {
      console.log('Error fetching subscribed rules ' + error)
      });

  }
  catch (err) {
    console.error('Error updating subscribe rules:');
    console.error(err);
    return ({staus: "err", err_code: err.code, err_message: err.message});
    //response.setStatusCode(500);
    //response.setBody({ error: { message: err.message, code: err.code } });
  }
  return({status: "success"});
};

module.exports.handler = async (context, event, callback) => {
  const authHandler = require(Runtime.getAssets()['/auth-handler.js'].path);
  authHandler(context, event, callback);

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const { room_sid, who, operation, state, whisperTo } = event;

  if (typeof room_sid === 'undefined') {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing room_sid',
        explanation: 'The room_sid parameter is missing.',
      },
    });
    return callback(null, response);
  }

  if(operation !== "enable" && operation !== "disable") {
response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'illegal operation',
        explanation: 'only disable or enable is allowed.',
      },
    });
    return callback(null, response);
  
  }

  if(state !== "inWhisper" && state !== "notInWhisper") {
response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'illegal state',
        explanation: 'only inWhisper or notInWhisper is allowed.',
      },
    });
    return callback(null, response);
  
  }

  if(state === "inWhisper" && whisperTo === "") {
response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'illegal whisper subject',
        explanation: 'when in whisper, the subject cannot be blank.',
      },
    });
    return callback(null, response);
  
  }

  const client = context.getTwilioClient();

  if (state==="notInWhisper"){
  client.video.rooms(room_sid).participants.list({status: 'connected', limit: 20})
    .then(participants => participants.forEach((participant)=>{
      if(JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(who))){
        console.log(who, participant.identity, operation)
        let res = operateAParticipantSubscription(context, room_sid, participant.sid, who, operation);

        if(res.status==="err") {
          response.setStatusCode(500);
          response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
          return callback(null, response);
        }
      }
    
  }));
  }

  if (state==="inWhisper"){
        let res = operateAParticipantSubscription(context, room_sid, whisperTo, who, operation);
  
        if(res.status==="err") {
          response.setStatusCode(500);
          response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
          return callback(null, response);
        }
      }
    
 


  response.setStatusCode(200);
  response.setBody({status: "success"});

  callback(null, response);
};
