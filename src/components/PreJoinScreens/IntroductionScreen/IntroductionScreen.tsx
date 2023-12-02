import React, { ChangeEvent, FormEvent, useState } from 'react';
import {
  Typography,
  makeStyles,
  TextField,
  Grid,
  Button,
  InputLabel,
  Theme,
  Select,
  MenuItem,
  FormControl,
} from '@material-ui/core';
import { useAppState } from '../../../state';
import { Steps } from '../PreJoinScreens';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '0.2em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  videoContainer: {
    width: '100%',
    align: 'start',
    justify: 'start',
    margin: '0em',
  },
  video: {
    width: '100%',
    align: 'start',
    justify: 'start',
  },

  joinButtons: {
    display: 'flex',
    alignContent: 'end',
    justifyContent: 'end',
    gap: '40px',
    margin: '0.5em',
    //float: 'inline-end',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      width: '50%',
      '& button': {
        margin: '0.5em 0',
      },
    },
  },
}));

interface IntroductionScreenProps {
  roleName: string;
  conditionName: string;
  roomName: string;
  setStep: (step: Steps) => void;
  nameReal: string;
}

export default function IntroductionScreen({
  roleName,
  conditionName,
  roomName,
  setStep,
  nameReal,
}: IntroductionScreenProps) {
  const classes = useStyles();
  const { user } = useAppState();

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Introduction Video
      </Typography>
      <Typography variant="body1">
        <strong>{nameReal}</strong>, Let's watch the introduction video before we start.
      </Typography>
      <Typography variant="body1">
        Experiment: <strong>{roomName}</strong>, Condition: <strong>{conditionName}</strong>, Role:{' '}
        <strong>{roleName}</strong>
      </Typography>

      <div className={classes.videoContainer}>
        <video
          className={classes.video}
          controls
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />
      </div>

      <div className={classes.joinButtons}>
        <Button variant="outlined" color="primary" onClick={() => setStep(Steps.roomNameStep)}>
          Cancel
        </Button>

        <Button variant="contained" color="primary" data-cy-join-now onClick={() => setStep(Steps.deviceSelectionStep)}>
          Continue
        </Button>
      </div>
    </>
  );
}
