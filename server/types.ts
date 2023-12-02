import { Twilio } from 'twilio';
import { TwilioResponse } from './bootstrap-globals';


export interface RuleTable {
	[key: string]: any;
}


export interface NameRole {
  role: string;
  name: string;
}

export interface ServerlessContext {
  getTwilioClient: () => Twilio;
  lastRuleTable: RuleTable;
  initRuleTable: RuleTable;
  nameTable: NameRole[];
  [key: string]: any;
}

export type ServerlessFunction = (
  context: ServerlessContext,
  body: any,
  callback: (err: any, response: TwilioResponse) => void
) => void;

