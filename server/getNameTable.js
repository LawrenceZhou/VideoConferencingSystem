/* global Twilio Runtime */
'use strict';


module.exports.handler = async (context, event, callback) => {
  const authHandler = require(Runtime.getAssets()['/auth-handler.js'].path);
  authHandler(context, event, callback);

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const { room_sid } = event;

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
///
  const lastNameTable = context.nameTable;

  response.setStatusCode(200);
  response.setBody({status: "success", name_table: context.nameTable});

  callback(null, response);
};
