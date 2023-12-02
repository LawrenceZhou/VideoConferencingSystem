import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@twilio/conversations';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { Typography, Badge, Chip } from '@material-ui/core';
import { Participant as PT } from 'twilio-video';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple, red, blue, pink, green, lime, grey } from '@material-ui/core/colors';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import { Box, Meter, Stack, Spinner, Grommet, Text, Avatar } from 'grommet';
import { AssistListening, Blog, Blank, Checkmark } from 'grommet-icons';
import { SyncClient } from 'twilio-sync';
import { useAppState, IWhisperEventType } from '../../state';
import { ThemeType } from 'grommet/themes';
import Divider from '@material-ui/core/Divider';

import Participant from '../Participant/Participant';
import IWhisperWindow from '../IWhisperWindow/IWhisperWindow';

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

    overflow: 'hidden',

    '& > *': {
      margin: theme.spacing(0.5),
    },
  },

  title: {
    // backgroundColor: 'black',
    color: 'white',
    paddingLeft: '5px',
  },
  content: {
    //backgroundColor: 'black',
    color: 'white',
    padding: '5px',
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

export default function IWhisperMonitorStyle() {
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
  const { isIWhisperedBy, setIsIWhisperedBy, eventHistory, setEventHistory, propertyHistory } = useAppState();
  const [effectiveEvent, setEffectiveEvent] = useState<IWhisperEventType | null>(null);
  const [whisperInstanceList, setWhisperInstanceList] = useState<WhisperInstanceType[]>([]);
  /*if (isIWhisperedBy !== "") {
    setWhisperState("WHISPERING");
  }*/
  const lastClickTimeRef = useRef(0);

  const onClick = () => {};
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

  useEffect(() => {
    if (propertyHistory && propertyHistory.length > 0 && propertyHistory[propertyHistory.length - 1]) {
      let lastProperty = propertyHistory[propertyHistory.length - 1];
      console.log(lastProperty);
      setInstanceProperty(lastProperty.id, lastProperty.property);

      //}
    }
    //return ()=>clearInterval(timerinterval.current);
  }, [propertyHistory]);

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
    } as WhisperInstanceType;

    //if not, add an instance to the list
    if (!previousInstance) {
      setWhisperInstanceList([...whisperInstanceList, newWhisperInstance]);
    }
    //if yes (bug?), delete previous ones, add a new instance
    else {
      let cleanedWhisperIntanceList = whisperInstanceList.filter(
        w =>
          !(w.from === iWhisperEvent.from && w.to === iWhisperEvent.to) &&
          !(w.from === iWhisperEvent.to && w.to === iWhisperEvent.from)
      );

      setWhisperInstanceList(cleanedWhisperIntanceList.concat(newWhisperInstance));
    }

    setTimeout(() => {
      removeWhisperInstanceById(newWhisperInstance.id);
    }, newWhisperInstance.ttl * 100 * 10);

    return;
  };

  const setInstanceProperty = function(id: string, property: string) {
    let instanceList = [...whisperInstanceList];
    let index = instanceList.findIndex(ins => ins.id == id);
    if (index != -1) {
      instanceList[index].property = property;
      setWhisperInstanceList(instanceList);
    }
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

    setWhisperInstanceList(cleanedWhisperIntanceList);

    return;
  };

  const removeWhisperInstanceById = function(id: string) {
    let cleanedInstanceList = whisperInstanceList.filter(w => w.id != id);
    setWhisperInstanceList(cleanedInstanceList);
  };

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <Typography variant="subtitle2"> I-Whisper Monitor </Typography>
      </div>
      <Box
        round="large"
        pad={{ right: 'small' }}
        gap="xsmall"
        width={{ min: '60px', max: '260px' }}
        align="center"
        background={'status-unknown'}
        direction="row"
      >
        <Avatar size="small" background={'placeholder'}>
          <Text>/</Text>
        </Avatar>
        <Text size="small">whisperInstance.from + whispers to + whisperInstance.to</Text>
      </Box>

      <Box
        round="large"
        pad={{ right: 'small' }}
        gap="xsmall"
        width={{ min: '60px', max: '260px' }}
        align="center"
        background={'status-ok'}
        direction="row"
      >
        <Avatar size="small" background={'focus'}>
          <Text>/</Text>
        </Avatar>
        <Text size="small">whisperInstance.from + whispers to + whisperInstance.to</Text>
      </Box>

      <Box
        round="large"
        pad={{ right: 'small' }}
        gap="xsmall"
        width={{ min: '60px', max: '260px' }}
        align="center"
        background={'status-critical'}
        direction="row"
      >
        <Avatar size="small" background={'status-error'}>
          <Text>/</Text>
        </Avatar>
        <Text size="small">whisperInstance.from + whispers to + whisperInstance.to</Text>
      </Box>
    </div>
  );
}
