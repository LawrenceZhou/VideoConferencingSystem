/* global Twilio Runtime */
'use strict';


module.exports.handler = async (context, event, callback) => {
  const authHandler = require(Runtime.getAssets()['/auth-handler.js'].path);
  authHandler(context, event, callback);

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const { name, role } = event;

  
  let lastNameTable = context.nameTable;

  lastNameTable = lastNameTable.filter((nRole)=> JSON.parse(JSON.stringify(nRole.role))!==JSON.parse(JSON.stringify(role)));
  console.log("delete all registred names with role ", role);
  let newTable = lastNameTable.concat({role:role, name:name} );
  console.log(newTable);
  context.nameTable = newTable;

  response.setStatusCode(200);
  response.setBody({status: "success"});

  callback(null, response);
};
