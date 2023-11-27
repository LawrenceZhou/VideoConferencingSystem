/* global Twilio Runtime */
'use strict';

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
   if(operation==="start") {
  context.LessonStarted = true;

}else {
  context.LessonStarted = false;
}
    response.setStatusCode(200);
    response.setBody("class operation done");
  
    console.log(response, context);
  callback(null, response);
};
