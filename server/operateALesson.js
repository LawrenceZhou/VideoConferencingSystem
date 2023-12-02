/* global Twilio Runtime */
'use strict';

const operateAParticipant = async function(context, room_sid, participant_sid, operation) {
  const client = context.getTwilioClient();
  try {
    if (operation === "start") {
      let rule1 = { type: 'include', all: true };
      let rule2 = { type: 'exclude', publisher: 'Researcher' };
      let rule3 = { type: 'exclude', kind: 'audio' };
      let rule4 = { type: 'include', kind: 'audio', publisher: 'Teacher' };
      let rules = [rule1, rule2, rule3, rule4];
      const subscribeRulesResponse = await client.video.rooms(room_sid).participants( participant_sid ).subscribeRules.update({ rules });
    }
    if (operation === "end") {
      let rule1 = { type: 'include', all: true };
      let rule2 = { type: 'exclude', publisher: 'Researcher' };

      let rules = [rule1, rule2];
      const subscribeRulesResponse = await client.video.rooms(room_sid).participants( participant_sid ).subscribeRules.update({ rules });
    }
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

  const { room_sid, operation } = event;

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

  /*if (typeof rules === 'undefined') {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing rules',
        explanation: 'The rules parameter is missing.',
      },
    });
    return callback(null, response);
  }*/

  const client = context.getTwilioClient();

  
  client.video.rooms(room_sid).participants.list({status: 'connected', limit: 20})
    .then(participants => participants.forEach((participant)=>{
    let res = operateAParticipant(context, room_sid, participant.sid, operation);

    if(res.status==="err") {
      response.setStatusCode(500);
      response.setBody({status: "error", error: { message: res.err_message, code: res.err_code } });
      return callback(null, response);
    }
  }));

  if (operation==="start") {
  context.LessonStarted = true;

  }else {
  context.LessonStarted = false;
  }

  response.setStatusCode(200);
  response.setBody({status: "success"});

  callback(null, response);
};
