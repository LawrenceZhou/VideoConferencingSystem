/* global Twilio Runtime */
'use strict';

module.exports.handler = async (context, event, callback) => {
  const authHandler = require(Runtime.getAssets()['/auth-handler.js'].path);
  authHandler(context, event, callback);

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
try{

  let AccessToken = require('twilio').jwt.AccessToken;
  let SyncGrant = AccessToken.SyncGrant;
  
  let syncGrant = new SyncGrant({
        serviceSid: process.env.TWILIO_SYNC_SERVICE_SID,
    });

  let identity = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';


  let token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_SYNC_API_KEY,
        process.env.TWILIO_SYNC_API_SECRET,
    );

  

  token.addGrant(syncGrant);
  token.identity = identity;

  response.setStatusCode(200);

  response.setBody({
      identity: identity,
      tokenSync: token.toJwt()
    });
}catch (err) {
    console.error('Error fetching sync token:');
    console.error(err);
    return ({staus: "err", err_code: err.code, err_message: err.message});
    response.setStatusCode(500);
    response.setBody({ error: { message: err.message, code: err.code } });
  }
    
  
  console.log(response);
  callback(null, response);
};
