import 'dotenv/config';
import { Request, Response } from 'express';
import { ServerlessContext, ServerlessFunction, RuleTable } from './types';
import Twilio from 'twilio';

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  TWILIO_CONVERSATIONS_SERVICE_SID,
  REACT_APP_TWILIO_ENVIRONMENT,
} = process.env;

const twilioClient = Twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
  region: REACT_APP_TWILIO_ENVIRONMENT === 'prod' ? undefined : REACT_APP_TWILIO_ENVIRONMENT,
});

const context: ServerlessContext = {
  ACCOUNT_SID: TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  ROOM_TYPE: 'group',
  CONVERSATIONS_SERVICE_SID: TWILIO_CONVERSATIONS_SERVICE_SID,
  getTwilioClient: () => twilioClient,
  LessonStarted: false,
  initRuleTable: {
    'Researcher': [{ type: 'include', all: true }],
    'Teacher': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 1': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 2': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 3': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 4': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 5': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 6': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
  } as RuleTable,
  lastRuleTable: {
    'Researcher': [{ type: 'include', all: true }],
    'Teacher': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 1': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 2': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 3': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 4': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 5': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
    'Student 6': [{ type: 'include', all: true }, { type: 'exclude', publisher: 'Researcher' }],
  } as RuleTable,
  nameTable: [
    {role:"Teacher",name:"Teacher"},
    {role:"Researcher",name: "Researcher"},
    {role:"Student 1",name:"Student 1"},
    {role:"Student 2",name:"Student 2"},
    {role:"Student 3",name:"Student 3"},
    {role:"Student 4",name:"Student 4"},
    {role:"Student 5",name:"Student 5"},
    {role:"Student 6",name:"Student 6"},
  ]
};

export function createExpressHandler(serverlessFunction: ServerlessFunction) {
  return (req: Request, res: Response) => {
    serverlessFunction(context, req.body, (_, serverlessResponse) => {
      const { statusCode, headers, body } = serverlessResponse;

      res
        .status(statusCode)
        .set(headers)
        .json(body);
    });
  };
}
