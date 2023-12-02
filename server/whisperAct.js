/* global Twilio Runtime */
'use strict';

const operateAParticipantSubscription = async function(context, room_sid, participant_sid, who, operation) {
  const client = context.getTwilioClient();
  try {
      let newRules;
      let action;
      let opposite;
      if(operation === "subscribe"){
        action = "include";
        opposite = "exclude";
      }else{
        action = "exclude";
        opposite = "include";
      }
      client.video.rooms(room_sid).participants.get(participant_sid)
        .subscribeRules.fetch()
        .then(subscribeRules => {
          let rules = subscribeRules.rules;
          console.log('old rules: ', rules);
          if(Array.isArray(rules)){
         
            rules = rules.filter((rule)=> JSON.parse(JSON.stringify(rule.publisher))!==JSON.parse(JSON.stringify(who)));
            console.log("delete all audio rules about ", who, rules);
              newRules = rules.concat({type:action, kind:'audio', publisher:who});
          }else {
            console.log("no rule");

              newRules=[{type:action, kind:'audio', publisher:who}];
          }
          
    console.log('new rules: ', newRules);
    const subscribeRulesResponse =  client.video.rooms(room_sid).participants( participant_sid ).subscribeRules.update({ rules: newRules });
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

  const { room_sid, from, to, action } = event;

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

 if(action !== "start" && action !== "end") {
response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'illegal action',
        explanation: 'only start or end is allowed.',
      },
    });
    return callback(null, response);
  
  }



  const client = context.getTwilioClient();

  if(action === "start"){
    //get from's audio is enabled or not
    client.video.rooms(room_sid).participants.get(from).publishedTracks.list()
    .then(publishedTracks => {
      publishedTracks.forEach(publishedTrack => {
        console.log(publishedTrack);
        if(JSON.parse(JSON.stringify(publishedTrack.kind)) === JSON.parse(JSON.stringify("audio"))){
          console.log("111", publishedTrack);
          console.log(publishedTrack);
          if(publishedTrack.enabled) {
            //(all - to) unsubscribe from's audio
            client.video.rooms(room_sid).participants.list({status: 'connected', limit: 20})
            .then(participants => participants.forEach((participant)=>{
              if(JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(from)) && JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(to))){
                console.log(from, participant.identity, action);
                let res = operateAParticipantSubscription(context, room_sid, participant.sid, from, "unsubscribe");
        
                if(res.status==="err") {
                  response.setStatusCode(500);
                  response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
                  return callback(null, response);
                }
              }
  
            }));
          }else{
            //to susbscribe from's audio
            let res = operateAParticipantSubscription(context, room_sid, to, from, "subscribe");
          }
        }
      })
    })

    //get to's audio is enabled or not
    client.video.rooms(room_sid).participants.get(to).publishedTracks.list()
    .then(publishedTracks => {
      publishedTracks.forEach(publishedTrack => {
        if(JSON.parse(JSON.stringify(publishedTrack.kind)) === "audio"){
          console.log(publishedTrack);
          if(publishedTrack.enabled) {
            //(all - from) unsubscribe to's audio
            client.video.rooms(room_sid).participants.list({status: 'connected', limit: 20})
            .then(participants => participants.forEach((participant)=>{
              if(JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(to)) && JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(from))){
                console.log(to, participant.identity, action);
                let res = operateAParticipantSubscription(context, room_sid, participant.sid, to, "unsubscribe");
        
                if(res.status==="err") {
                  response.setStatusCode(500);
                  response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
                  return callback(null, response);
                }
              }
  
            }));
          }else{
            //do nothing
          }
        }
      })
    })
  }
  //do nothing
  /*if(action === "end"){
    //get from's audio is enabled or not
    client.video.rooms(room_sid).participants.get(from).publishedTracks.list()
    .then(publishedTracks => {
      publishedTracks.forEach(publishedTrack => {
        if(JSON.parse(JSON.stringify(publishedTrack.kind)) === "audio"){
          console.log(publishedTrack);
          if(publishedTrack.enabled) {
            //(all - to) subscribe from's audio
            client.video.rooms(room_sid).participants.list({status: 'connected', limit: 20})
            .then(participants => participants.forEach((participant)=>{
              if(JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(from)) && JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(to))){
                console.log(from, participant.identity, action);
                let res = operateAParticipantSubscription(context, room_sid, participant.sid, from, "subscribe");
        
                if(res.status==="err") {
                  response.setStatusCode(500);
                  response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
                  return callback(null, response);
                }
              }
  
            }));
          }else{
            //do nothing
          }
        }
      })
    })

    //get to's audio is enabled or not
    client.video.rooms(room_sid).participants.get(to).publishedTracks.list()
    .then(publishedTracks => {
      publishedTracks.forEach(publishedTrack => {
        if(JSON.stringify(publishedTrack.kind) === "audio"){
          console.log(publishedTrack);
          if(publishedTrack.enabled) {
            //(all - from) subscribe to's audio
            client.video.rooms(room_sid).participants.list({status: 'connected', limit: 20})
            .then(participants => participants.forEach((participant)=>{
              if(JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(to)) && JSON.parse(JSON.stringify(participant.identity)) !== JSON.parse(JSON.stringify(from))){
                console.log(to, participant.identity, action);
                let res = operateAParticipantSubscription(context, room_sid, participant.sid, to, "subscribe");
        
                if(res.status==="err") {
                  response.setStatusCode(500);
                  response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
                  return callback(null, response);
                }
              }
  
            }));
          }else{
            //do nothing
          }
        }
      })
    })
  }*/
  


  response.setStatusCode(200);
  response.setBody({status: "success"});

  callback(null, response);
};
