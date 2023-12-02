import React from 'react';
import { Message } from '@twilio/conversations';
import MessageInfo from './MessageInfo/MessageInfo';
import MessageListScrollContainer from './MessageListScrollContainer/MessageListScrollContainer';
import TextMessage from './TextMessage/TextMessage';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import MediaMessage from './MediaMessage/MediaMessage';
import { Avatar, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple, red, blue, pink, green, lime } from '@material-ui/core/colors';
import { Box } from 'grommet';
import { useAppState, IWhisperEventType } from '../../../state';

interface MessageListProps {
  messages: Message[];
  to: string;
  setTo: (to: string) => void;
}

interface Attributes {
  [key: string]: string;
}

interface StyleInfo {
  identity: string;
  represent: string;
  color: string;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },

  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  red: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },

  blue: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
  },

  pink: {
    color: theme.palette.getContrastText(pink[500]),
    backgroundColor: pink[500],
  },

  green: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },

  lime: {
    color: theme.palette.getContrastText(lime[500]),
    backgroundColor: lime[500],
  },
}));

const getFormattedTime = (message?: Message) =>
  message?.dateCreated?.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' }).toLowerCase();

export default function MessageList({ messages, to, setTo }: MessageListProps) {
  const classes = useStyles();

  const styleSheet: Array<StyleInfo> = [
    { identity: 'Teacher', represent: 'TE', color: classes.purple },
    { identity: 'Student 1', represent: 'S1', color: classes.orange },
    { identity: 'Student 2', represent: 'S2', color: classes.green },
    { identity: 'Student 3', represent: 'S3', color: classes.pink },
    { identity: 'Student 4', represent: 'S4', color: classes.lime },
    { identity: 'Student 5', represent: 'S5', color: classes.red },
    { identity: 'Student 6', represent: 'S6', color: classes.blue },
    { identity: 'Researcher', represent: 'RE', color: classes.purple },
  ];
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const {
    experimentNameG,
    roleNameG,
    whisperAct,
    ifALessonStarted,
    whisperState,
    setWhisperState,
    isBackdropOpen,
    setIsBackdropOpen,
    nameTable,
  } = useAppState();

  return (
    <MessageListScrollContainer messages={messages}>
      {messages.map((message, idx) => {
        const time = getFormattedTime(message)!;
        const previousTime = getFormattedTime(messages[idx - 1]);

        const isLocalParticipant = localParticipant.identity === message.author;

        let message_to = '';
        console.log(message.attributes);
        if (message.attributes) {
          //let parsed_attributes= JSON.parse(message.attributes as string);
          let parsed_attributes = message.attributes as Attributes;
          message_to = parsed_attributes.to;
          console.log(message.attributes, parsed_attributes, message_to);
          //message_to = message.attributes.to! as string;
          //parsedJSON['to'];
        }

        let previous_to = '';
        if (idx > 0) {
          //let parsed_attributes= JSON.parse(message.attributes as string);
          let previous_parsed_attributes = messages[idx - 1].attributes as Attributes;
          previous_to = previous_parsed_attributes.to;
          console.log(previous_to);
          //message_to = message.attributes.to! as string;
          //parsedJSON['to'];
        }

        // Display the MessageInfo component when the author or formatted timestamp differs from the previous message
        const shouldDisplayMessageInfo =
          time !== previousTime || message.author !== messages[idx - 1]?.author || message_to !== previous_to;

        const toShow =
          message_to === localParticipant.identity ||
          message.author === localParticipant.identity ||
          message_to === 'all';
        let message_to_convert = message_to === localParticipant.identity ? 'You' : message_to;

        if (
          JSON.parse(JSON.stringify(message_to_convert)) !== 'all' &&
          JSON.parse(JSON.stringify(message_to_convert)) !== 'You'
        ) {
          message_to_convert = nameTable!.find(n => n.role === message_to_convert)!.name;
        }
        const style = styleSheet.find(s => s.identity === message.author)!;

        if (toShow) {
          return (
            <React.Fragment key={message.sid}>
              <Box direction="row" justify="start" align="start">
                <Box height={{ min: '40px', max: '40px' }} width={{ min: '48px', max: '48px' }}>
                  {shouldDisplayMessageInfo && (
                    <div style={{ paddingTop: '1.425em' }}>
                      <Avatar className={style.color}>{style.represent}</Avatar>
                    </div>
                  )}
                </Box>
                <Box>
                  {shouldDisplayMessageInfo && nameTable && (
                    <Box width={{ min: '248px', max: '248px' }}>
                      <MessageInfo
                        author={nameTable!.find(n => n.role === message.author)!.name}
                        authorID={message.author || ''}
                        isLocalParticipant={isLocalParticipant}
                        dateCreated={time}
                        to={message_to_convert}
                        toID={message_to}
                        setTo={setTo}
                      />
                    </Box>
                  )}
                  {message.type === 'text' && (
                    <TextMessage body={message.body!} isLocalParticipant={isLocalParticipant} />
                  )}
                  {message.type === 'media' && <MediaMessage media={message.attachedMedia![0]} />}
                </Box>
              </Box>
            </React.Fragment>
          );
        }
        return null;
      })}
    </MessageListScrollContainer>
  );
}
