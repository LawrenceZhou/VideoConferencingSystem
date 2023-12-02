/* global Twilio Runtime */
'use strict';

module.exports.handler = async (context, event, callback) => {
  const authHandler = require(Runtime.getAssets()['/auth-handler.js'].path);
  authHandler(context, event, callback);

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  
    response.setStatusCode(200);
    if (context.LessonStarted){
    	response.setBody({started: "started"});
    }else {
    	response.setBody({started: "not_started"});
    }
  
    console.log(response);
  callback(null, response);
};
