import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@twilio/conversations';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { Typography, Badge, Chip } from '@material-ui/core';
import { Participant as PT } from 'twilio-video';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple, red, blue, pink, green, lime, grey } from '@material-ui/core/colors';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import { Box, Button, Meter, Stack, Spinner, Grommet, Text, Avatar, InfiniteScroll } from 'grommet';
import { AssistListening, Blog, Blank, Checkmark, Alert, Like, Dislike, Revert } from 'grommet-icons';
import { SyncClient } from 'twilio-sync';
import { useAppState, IWhisperEventType } from '../../state';
import { ThemeType } from 'grommet/themes';
import Divider from '@material-ui/core/Divider';

import Participant from '../Participant/Participant';
import IWhisperWindow from '../IWhisperWindow/IWhisperWindow';
import IconButton from '@material-ui/core/IconButton';

import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplayIcon from '@material-ui/icons/Replay';

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
    height: '100%',
    width: '100%',

    '& > *': {
      margin: theme.spacing(0.5),
    },
  },

  title: {
    backgroundColor: 'white',
    color: 'grey',
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

interface StylePropertyInfo {
  property: string;
  color: string;
}

interface StateWithSubject {
  state: string;
  subject: string;
}

export interface WhisperInstanceType {
  id: string;
  from: string;
  to: string;
  property: string;
  ttl: number;
}

const getFormattedTime = (message?: Message) =>
  message?.dateCreated?.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' }).toLowerCase();

export default function IWhisperController() {
  const { room, pipWindow } = useVideoContext();

  const localParticipant = room!.localParticipant;
  const participants = useParticipants();
  const participantList = Array.from<PT>([localParticipant]).concat(participants);
  const classes = useStyles();
  const titlegrey = grey[900];
  const styleSheet: Array<StyleInfo> = [
    { identity: 'Teacher', represent: 'TE', color: classes.purple },
    { identity: 'Student 1', represent: 'S1', color: classes.orange },
    { identity: 'Student 2', represent: 'S2', color: classes.green },
    { identity: 'Student 3', represent: 'S3', color: classes.pink },
    { identity: 'Student 4', represent: 'S4', color: classes.lime },
    { identity: 'Student 5', represent: 'S5', color: classes.red },
    { identity: 'Student 6', represent: 'S6', color: classes.blue },
  ];

  const stylePropertySheet: Array<StylePropertyInfo> = [
    { property: 'N/A', color: 'black' },
    { property: 'OK', color: 'primary' },
    { property: 'NG', color: 'secondary' },
  ];

  let counter = 0; //100ms as a unit
  //const [counter, setCounter] = useState<number>(0);

  let longestWhisperTime = 300;
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
  const {
    isIWhisperedBy,
    setIsIWhisperedBy,
    eventHistory,
    setEventHistory,
    syncClient,
    nameTable,
    whisperInstanceList,
    setWhisperInstanceList,
  } = useAppState();
  const [effectiveEvent, setEffectiveEvent] = useState<IWhisperEventType | null>(null);
  //const [whisperInstanceList, setWhisperInstanceList] = useState<WhisperInstanceType[]>([]);
  /*if (isIWhisperedBy !== "") {
    setWhisperState("WHISPERING");
  }*/
  const lastClickTimeRef = useRef(0);

  useEffect(() => {
    if (eventHistory && eventHistory.length > 0 && eventHistory[eventHistory.length - 1]) {
      let lastEvent = eventHistory[eventHistory.length - 1];
      console.log(lastEvent);

      if (lastEvent.category === 'ACK') {
        addWhisperInstance(lastEvent);
        //const newWhisperInstance = {id: lastEvent.id, from:lastEvent.to, to:lastEvent.from, ttl: longestWhisperTime + 50, property: "N/A"} as WhisperInstanceType;
        //setWhisperInstanceList([...whisperInstanceList, newWhisperInstance]);
      }

      if (lastEvent.category === 'whisperEnd') {
        removeWhisperInstanceByEvent(lastEvent);
      }

      //}
    }
    //return ()=>clearInterval(timerinterval.current);
  }, [eventHistory]);

  const addWhisperInstance = function(iWhisperEvent: IWhisperEventType) {
    //check if already have talk between two participants
    let previousInstance = whisperInstanceList.find(
      w =>
        (w.from === iWhisperEvent.from && w.to === iWhisperEvent.to) ||
        (w.from === iWhisperEvent.to && w.to === iWhisperEvent.from)
    );
    const newWhisperInstance = {
      id: iWhisperEvent.id,
      from: iWhisperEvent.to,
      to: iWhisperEvent.from,
      ttl: longestWhisperTime + 50,
      property: 'N/A',
      timestamp: iWhisperEvent.timestamp,
    } as WhisperInstanceType;

    //if not, add an instance to the list
    //if (!previousInstance){
    //  setWhisperInstanceList([...whisperInstanceList, newWhisperInstance]);
    //}
    //if yes (bug?), delete previous ones, add a new instance
    //else {
    //let cleanedWhisperIntanceList = whisperInstanceList.filter((w)=>!(w.from === iWhisperEvent.from && w.to === iWhisperEvent.to) && !(w.from === iWhisperEvent.to && w.to === iWhisperEvent.from));

    setWhisperInstanceList([newWhisperInstance].concat(whisperInstanceList));
    //}

    //setTimeout(() => {
    //        removeWhisperInstanceById(newWhisperInstance.id);
    //      }, newWhisperInstance.ttl * 100);

    return;
  };

  const removeWhisperInstanceByEvent = function(iWhisperEvent: IWhisperEventType) {
    //check if there is a talk between two participants
    let previousInstance = whisperInstanceList.find(
      w =>
        (w.from === iWhisperEvent.from && w.to === iWhisperEvent.to) ||
        (w.from === iWhisperEvent.to && w.to === iWhisperEvent.from)
    );

    //if not (bug?, or maybe exeeded ttl), do nothing
    if (!previousInstance) {
      return;
    }
    //if yes, delete all instances
    let cleanedWhisperIntanceList = whisperInstanceList.filter(
      w =>
        !(w.from === iWhisperEvent.from && w.to === iWhisperEvent.to) &&
        !(w.from === iWhisperEvent.to && w.to === iWhisperEvent.from)
    );

    //setWhisperInstanceList(cleanedWhisperIntanceList);

    return;
  };

  const removeWhisperInstanceById = function(id: string) {
    let cleanedInstanceList = whisperInstanceList.filter(w => w.id != id);
    setWhisperInstanceList(cleanedInstanceList);
  };

  const setGoodWhisper = function(id: string) {
    let instanceList = [...whisperInstanceList];
    let index = instanceList.findIndex(ins => ins.id == id);
    if (index != -1) {
      sendProperty(id, 'OK');
      instanceList[index].property = 'OK';
      setWhisperInstanceList(instanceList);
    }
  };

  const setBadWhisper = function(id: string) {
    let instanceList = [...whisperInstanceList];
    let index = instanceList.findIndex(ins => ins.id === id);
    if (index != -1) {
      sendProperty(id, 'NG');
      instanceList[index].property = 'NG';
      setWhisperInstanceList(instanceList);
    }
  };

  const setNeutralWhisper = function(id: string) {
    let instanceList = [...whisperInstanceList];
    let index = instanceList.findIndex(ins => ins.id === id);
    if (index != -1) {
      sendProperty(id, 'N/A');
      instanceList[index].property = 'N/A';
      setWhisperInstanceList(instanceList);
    }
  };

  const sendProperty = function(id: string, property: string) {
    //fetch('https://34.222.53.145:5000/token', { method: 'POST' })
    if (syncClient) {
      syncClient.list('whisperActionList').then(list => {
        list
          .push({ action: 'setProperty', id: id, property: property, user: 'XXX' }, { ttl: 86400 })
          .then(function(item) {
            console.log('List Item push() successful, item index:' + item.index + ', value: ', item.data);
          })
          .catch(function(error) {
            console.error('List Item push() failed', error);
          });
      });
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle2"> I-Whisper Controller </Typography>
      </div>
      <Box height="75%" width="95%" overflow="auto">
        <InfiniteScroll items={whisperInstanceList}>
          {(item: any) => {
            //const time = getFormattedTime(message)!;
            //const previousTime = getFormattedTime(messages[idx - 1]);

            // Display the MessageInfo component when the author or formatted timestamp differs from the previous message
            //const shouldDisplayMessageInfo = time !== previousTime || message.author !== messages[idx - 1]?.author;

            //const isLocalParticipant = localParticipant.identity === message.author;
            const styleFrom = styleSheet.find(s => s.identity === item.from)!;
            const styleTo = styleSheet.find(s => s.identity === item.to)!;

            //const percent =   talkingpPercent;
            //const opacity =  iconOpacity;

            return (
              <Box
                height={{ min: '60px', max: '120px' }}
                width={{ min: '60px', max: '260px' }}
                gap="xsmall"
                margin="xsmall"
              >
                <Box
                  round="large"
                  pad={{ right: 'small' }}
                  gap="xsmall"
                  align="center"
                  background={
                    item.property === 'N/A'
                      ? 'status-unknown'
                      : item.property === 'OK'
                      ? 'status-ok'
                      : 'status-critical'
                  }
                  direction="row"
                >
                  <Avatar
                    size="small"
                    background={
                      item.property === 'N/A' ? 'placeholder' : item.property === 'OK' ? 'focus' : 'status-error'
                    }
                  >
                    {item.property === 'N/A' ? (
                      <Text>/</Text>
                    ) : item.property === 'OK' ? (
                      <Checkmark color="white" />
                    ) : (
                      <Text>!</Text>
                    )}
                  </Avatar>
                  <Box>
                    {Array.isArray(nameTable) && (
                      <Text size="small">
                        {nameTable!.find(n => n.role === item.from)!.name +
                          ' whispers to ' +
                          nameTable!.find(n => n.role === item.to)!.name}
                      </Text>
                    )}
                  </Box>
                </Box>

                <Box direction="row" justify="end" gap="xsmall" align="center">
                  <Box margin={{ right: 'medium' }}>
                    <Text size="small">{new Date(item.timestamp).toLocaleTimeString('en-us').toLowerCase()}</Text>
                  </Box>

                  <Avatar size="small" background="status-ok" onClick={() => setGoodWhisper(item.id)}>
                    <Like color="white" size="small" />
                  </Avatar>

                  <Avatar size="small" pad="xsmall" background="status-critical" onClick={() => setBadWhisper(item.id)}>
                    <Dislike color="white" size="small" />
                  </Avatar>

                  <Avatar size="small" background="status-unknown" onClick={() => setNeutralWhisper(item.id)}>
                    <Revert color="white" size="small" />
                  </Avatar>
                </Box>
              </Box>
            );
          }}
        </InfiniteScroll>
      </Box>
    </div>
  );
}
