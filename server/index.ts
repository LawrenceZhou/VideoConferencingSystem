import './bootstrap-globals';
import { createExpressHandler } from './createExpressHandler';
import express, { RequestHandler } from 'express';
import path from 'path';
import { ServerlessFunction } from './types';
//const fs = require("fs");
//const https = require("https");

const PORT = process.env.PORT ?? 8081;
//const PORT = 5000;

const app = express();
app.use(express.json());

//const key = fs.readFileSync(path.resolve("server/localhost-key.pem"), "utf-8");
//const cert = fs.readFileSync(path.resolve("server/localhost.pem"), "utf-8");

// This server reuses the serverless endpoints from the "plugin-rtc" Twilio CLI Plugin, which is used when the "npm run deploy:twilio-cli" command is run.
// The documentation for this endpoint can be found in the README file here: https://github.com/twilio-labs/plugin-rtc
const tokenFunction: ServerlessFunction = require('@twilio-labs/plugin-rtc/src/serverless/functions/token').handler;
const tokenEndpoint = createExpressHandler(tokenFunction);

const recordingRulesFunction: ServerlessFunction = require('@twilio-labs/plugin-rtc/src/serverless/functions/recordingrules')
  .handler;
const recordingRulesEndpoint = createExpressHandler(recordingRulesFunction);

const subscribeRulesFunction: ServerlessFunction = require('./subscribeRules').handler;
const subscribeRulesEndpoint = createExpressHandler(subscribeRulesFunction);

const operateALessonFunction: ServerlessFunction = require('./operateALesson').handler;
const operateALessonEndpoint = createExpressHandler(operateALessonFunction);

const ifALessonStartedFunction: ServerlessFunction = require('./ifALessonStarted').handler;
const ifALessonStartedEndpoint = createExpressHandler(ifALessonStartedFunction);

const noopMiddleware: RequestHandler = (_, __, next) => next();
const authMiddleware =
  process.env.REACT_APP_SET_AUTH === 'firebase' ? require('./firebaseAuthMiddleware') : noopMiddleware;

app.all('/token', authMiddleware, tokenEndpoint);
app.all('/recordingrules', authMiddleware, recordingRulesEndpoint);
app.all('/subscribeRules', authMiddleware, subscribeRulesEndpoint);
app.all('/operateALesson', authMiddleware, operateALessonEndpoint);
app.all('/ifALessonStarted', authMiddleware, ifALessonStartedEndpoint);
/*
app.all('/subscribeRules', (req, res) => {
  client.video.rooms('RMXXXX').participants.get('Adam')
.subscribeRules.update({
  rules: [
    {"type": "include", "kind": "audio"}
  ]
})
.then(result => {
  console.log('Subscribe Rules updated successfully')
})
.catch(error => {
  console.log('Error updating rules ' + error)
});
});*/

app.use((req, res, next) => {
  // Here we add Cache-Control headers in accordance with the create-react-app best practices.
  // See: https://create-react-app.dev/docs/production-build/#static-file-caching
  if (req.path === '/' || req.path === 'index.html') {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, '../build/index.html'), { etag: false, lastModified: false });
  } else {
    res.set('Cache-Control', 'max-age=31536000');
    next();
  }
});

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (_, res) => {
  // Don't cache index.html
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../build/index.html'), { etag: false, lastModified: false });
});

app.listen(PORT, () => console.log(`twilio-video-app-react server running on ${PORT}`));


//https.createServer({ key, cert }, app).listen(PORT);
