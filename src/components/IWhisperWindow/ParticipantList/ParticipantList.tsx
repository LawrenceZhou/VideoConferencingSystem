import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@twilio/conversations';
import MessageInfo from './MessageInfo/MessageInfo';
import ParticipantListScrollContainer from './ParticipantListScrollContainer/ParticipantListScrollContainer';
import TextMessage from './TextMessage/TextMessage';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import MediaMessage from './MediaMessage/MediaMessage';
import { Avatar, Typography } from '@material-ui/core';
import { Participant } from 'twilio-video';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple, red, blue, pink, green, lime } from '@material-ui/core/colors';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import { Box, Meter, Stack, Spinner, Grommet, InfiniteScroll } from 'grommet';
import { AssistListening, Blog, Blank } from 'grommet-icons';
import { SyncClient } from 'twilio-sync';
import { useAppState, IWhisperEventType } from '../../../state';
import { ThemeType } from 'grommet/themes';
import Divider from '@material-ui/core/Divider';
import { RecordingRule, RecordingRules, RoomType } from '../../../types';
import MessageListScrollContainer from '../../ChatWindow/MessageList/MessageListScrollContainer/MessageListScrollContainer';

import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';

const theme: ThemeType = {
  spinner: {
    container: {
      pad: 'none',
      size: '30px',
    },
  },
};

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

interface StyleInfo {
  identity: string;
  represent: string;
  color: string;
}

interface StateWithSubject {
  state: string;
  subject: string;
}

const getFormattedTime = (message?: Message) =>
  message?.dateCreated?.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' }).toLowerCase();

export default function ParticipantList() {
  const { room } = useVideoContext();
  const { experimentNameG, roleNameG, updateSubscribeRules, ifALessonStarted } = useAppState();

  const localParticipant = room!.localParticipant;
  const participants = useParticipants();
  const participantList = Array.from<Participant>([localParticipant]).concat(participants);
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

  let counter = 0; //100ms as a unit
  //const [counter, setCounter] = useState<number>(0);

  let longestWhisperTime = 150;
  let longestWaitTime = 50;
  let timerinterval = useRef((null as unknown) as any);

  const [ms, setMs] = useState<number>(counter);
  //const [whisperingTo, setWhisperingTo] = useState<string>("");
  //state: IDLE, STARTING, SENDING, (ENDING), RECEIVING
  //const [whisperState, setWhisperState] = useState<StateWithSubject>({state:"IDLE", subject:localParticipant.identity});
  const [whisperState, setWhisperState] = useState<StateWithSubject>({
    state: 'IDLE',
    subject: localParticipant.identity,
  });
  const { isIWhisperedBy, setIsIWhisperedBy, eventHistory, setEventHistory } = useAppState();
  const [effectiveEvent, setEffectiveEvent] = useState<IWhisperEventType | null>(null);

  /*if (isIWhisperedBy !== "") {
    setWhisperState("WHISPERING");
  }*/
  const lastClickTimeRef = useRef(0);

  //},[]);

  const timer = function(start: any, toIdentity: string, currentState: string) {
    console.log('tick tock');
    console.log(start);
    if (start === true && counter >= 1) {
      console.log(counter);

      timerinterval.current = setInterval(() => {
        console.log(counter, whisperState.state, currentState);
        if (currentState === 'SENDING' || currentState === 'RECEIVING') {
          if (counter >= longestWhisperTime) {
            console.log('whisper over time');
            returnToIDLE(toIdentity);
            sendSignal('whisperEnd', toIdentity);
          }
        } else {
          if (counter >= longestWaitTime) {
            console.log('wait over time');
            returnToIDLE(toIdentity);
            sendSignal('CANCEL', toIdentity);
          }
          //whisperEnd(null, whisperingTo);
        }
        setMs(counter); //When I remove this, the infinite loop disappears.

        counter += 1;
        //setCounter(counter + 1);
        //@ts-ignore
      }, [100]);
    } else {
      setMs(0);
    }
  };

  useEffect(() => {
    if (eventHistory && eventHistory.length > 0 && eventHistory[eventHistory.length - 1]) {
      let lastEvent = eventHistory[eventHistory.length - 1];
      console.log(lastEvent, localParticipant.identity);
      if (lastEvent.to === localParticipant.identity) {
        if (lastEvent.category === 'whisperStart') {
          if (whisperState.state === 'IDLE') {
            sendSignal('ACK', lastEvent.from);
            turnToState('RECEIVING', lastEvent.from);
          } else {
            //if(whisperState==="")
            sendSignal('BUSY', lastEvent.from);
          }
        }

        if (lastEvent.category === 'ACK') {
          if (whisperState.state === 'STARTING' && lastEvent.from === whisperState.subject) {
            turnToState('SENDING', lastEvent.from);
          } else {
            return;
          }
        }

        if (lastEvent.category === 'BUSY') {
          if (whisperState.state === 'STARTING' && lastEvent.from === whisperState.subject) {
            returnToIDLE(lastEvent.from);
          } else {
            return;
          }
        }
        if (lastEvent.category === 'CANCEL') {
          if (lastEvent.from === whisperState.subject) {
            returnToIDLE(lastEvent.from);
          } else {
            return;
          }
        }

        if (lastEvent.category === 'whisperEnd') {
          if (lastEvent.from === whisperState.subject) {
            returnToIDLE(lastEvent.from);
          } else {
            return;
          }
        }
      }
    }

    //return ()=>clearInterval(timerinterval.current);
  }, [eventHistory]);

  const turnToState = function(nextState: string, toIdentity: string) {
    timer(false, toIdentity, 'IDLE');
    setMs(0);
    //setCounter(0);
    counter = 0;
    clearInterval(timerinterval.current);
    console.log('change to state: ', nextState);
    //if(nextState === "SENDING" || nextState === "RECEIVING" || nextState === "STARTING") {
    counter = 1;
    //setCounter(1);
    //clearInterval(timerinterval.current);

    timer(true, toIdentity, nextState);
    //}
    setWhisperState({ state: nextState, subject: toIdentity });
    console.log(whisperState);
    if (nextState === 'SENDING' || nextState === 'RECEIVING') {
      const rule1: RecordingRule = { type: 'include', all: true };
      const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
      const rule3: RecordingRule = { type: 'exclude', kind: 'audio' };
      const rule4: RecordingRule = { type: 'include', kind: 'audio', publisher: 'Teacher' };
      const rule5: RecordingRule = { type: 'include', kind: 'audio', publisher: toIdentity };
      const rules: RecordingRules = [rule1, rule2, rule3, rule4, rule5];

      updateSubscribeRules(room!.sid, roleNameG, rules);
    }
    //clearInterval(timerinterval.current);
    //setWhisperState(nextState);
    //setWhisperingTo(toIdentity);
  };

  const returnToIDLE = function(toIdentity: string) {
    setWhisperState({ state: 'IDLE', subject: localParticipant.identity });
    //setWhisperState("IDLE");
    //setWhisperingTo("");
    timer(false, toIdentity, 'IDLE');
    setMs(0);
    //setCounter(0);
    counter = 0;
    clearInterval(timerinterval.current);
    const rule1: RecordingRule = { type: 'include', all: true };
    const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
    const rule3: RecordingRule = { type: 'exclude', kind: 'audio' };
    const rule4: RecordingRule = { type: 'include', kind: 'audio', publisher: 'Teacher' };
    const rules: RecordingRules = [rule1, rule2, rule3, rule4];

    updateSubscribeRules(room!.sid, roleNameG, rules);
  };

  const sendSignal = function(signal: string, to: string) {
    fetch('https://34.222.53.145:5000/token', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        const syncClient = new SyncClient(data.token);
        syncClient.list('actionList').then(list => {
          list
            .push(
              {
                action: signal,
                from: localParticipant.identity,
                to: to,
                id: localParticipant.identity + Date.now().toString(),
                user: 'XXX',
              },
              { ttl: 86400 }
            )
            .then(function(item) {
              console.log('List Item push() successful, item index:' + item.index + ', value: ', item.data);
            })
            .catch(function(error) {
              returnToIDLE(to);
              console.error('List Item push() failed', error);
            });
        });
      });
  };

  //if()

  const togglIWhisper = (e: any, toIdentity: string) => {
    e.preventDefault();

    if (localParticipant.identity === toIdentity) {
      return;
    }

    if (Date.now() - lastClickTimeRef.current < 1000) {
      return;
    }

    lastClickTimeRef.current = Date.now();

    if (whisperState.state === 'IDLE') {
      sendSignal('whisperStart', toIdentity);
      turnToState('STARTING', toIdentity);
    }

    if (whisperState.state === 'RECEIVING' || whisperState.state === 'SENDING') {
      if (whisperState.subject === toIdentity) {
        sendSignal('whisperEnd', toIdentity);
        returnToIDLE(toIdentity);
      } else {
        //do nothing
        return;
      }
    }

    if (whisperState.state === 'STARTING') {
      if (whisperState.subject === toIdentity) {
        sendSignal('CANCEL', toIdentity);
        returnToIDLE(toIdentity);
      } else {
        //do nothing
        return;
      }
    }

    if (whisperState.state === 'ENDING') {
      //do nothing
      return;
    }
  };

  let talkingpPercent = (ms / longestWhisperTime) * 100;
  //let percent = 100;
  let opacityStart = 0.25;
  let opacityEnd = 1.0;
  let halfLoop = 15;
  let opacityStep = (opacityEnd - opacityStart) / halfLoop;

  let iconOpacity = 0;

  let remain = ms % (halfLoop * 2);
  if (remain < halfLoop) {
    iconOpacity = opacityStart + remain * opacityStep;
  } else {
    iconOpacity = opacityEnd - (remain - halfLoop) * opacityStep;
  }

  let timeInfo = 0;
  let message = '';
  if (whisperState.state === 'RECEIVING') {
    timeInfo = Math.ceil(ms / 10);
    message = timeInfo.toString() + 's';
  }

  if (whisperState.state === 'SENDING') {
    timeInfo = Math.max(Math.ceil((longestWhisperTime - ms) / 10), 0);
    message = timeInfo.toString() + 's left';
  }
  if (whisperState.state === 'STARTING') {
    message = "Startin'...";
  }

  if (whisperState.state === 'ENDING') {
    message = 'Ending...';
  }

  return (
    <Box overflow="scroll" height="100%" width="95%">
      <InfiniteScroll items={participantList}>
        {(item: any) => {
          //const time = getFormattedTime(message)!;
          //const previousTime = getFormattedTime(messages[idx - 1]);

          // Display the MessageInfo component when the author or formatted timestamp differs from the previous message
          //const shouldDisplayMessageInfo = time !== previousTime || message.author !== messages[idx - 1]?.author;

          //const isLocalParticipant = localParticipant.identity === message.author;
          const style = styleSheet.find(s => s.identity === item.identity)!;
          const isSelf = item.identity === localParticipant.identity;
          const isTalkingTo = !isSelf && item.identity === whisperState.subject;
          const meterColor = isTalkingTo && whisperState.state === 'SENDING' ? 'brand' : 'transparent';
          let cursorStyle = 'pointer';
          if (isSelf) {
            cursorStyle = 'not-allowed';
          }
          if (whisperState.state !== 'IDLE' && !isTalkingTo) {
            cursorStyle = 'not-allowed';
          }

          //const percent =   talkingpPercent;
          //const opacity =  iconOpacity;
          console.log(whisperState);
          return (
            <>
              <Box
                height={{ min: '60px', max: '60px' }}
                direction="row"
                pad="5px"
                gap="5px"
                align="center"
                onClick={e => togglIWhisper(e, item.identity)}
                style={{ cursor: cursorStyle }}
              >
                {isTalkingTo ? (
                  <Box width="42px" height="40px" align="center" justify="center" pad={{ top: '3px' }} gap="2px">
                    <Box width="30px" height="30px">
                      {whisperState.state === 'SENDING' && (
                        <Stack anchor="center">
                          <Box align="center">
                            <Meter
                              type="circle"
                              background="transparent"
                              size="28px"
                              thickness="xxsmall"
                              values={[{ value: talkingpPercent, color: meterColor }]}
                            />
                          </Box>
                          <Box pad="none">
                            <AssistListening size="20px" color="brand" style={{ opacity: iconOpacity }} />
                          </Box>
                        </Stack>
                      )}
                      {whisperState.state === 'RECEIVING' && (
                        <Blog color="brand" size="24px" style={{ opacity: iconOpacity, paddingLeft: '6px' }} />
                      )}
                      {whisperState.state === 'STARTING' && <Spinner size="small" color="brand" />}
                    </Box>
                    <Box>
                      <Typography variant="caption" style={{ color: '#606B85' }}>
                        {message}
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                <Avatar className={style.color}>{style.represent}</Avatar>

                <div> {item.identity}</div>
                <div style={{ color: '#606B85' }}>{isSelf ? '(You)' : null}</div>
              </Box>
              <Divider />
            </>
          );
        }}
      </InfiniteScroll>
    </Box>
  );
}
