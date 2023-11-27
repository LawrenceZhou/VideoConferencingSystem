import React from 'react';

import AudioInputList from './AudioInputList/AudioInputList';
import AudioOutputList from './AudioOutputList/AudioOutputList';
import {
  DialogContent,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  Button,
  Theme,
  DialogTitle,
  Hidden,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VideoInputList from './VideoInputList/VideoInputList';
import MaxGalleryViewParticipants from './MaxGalleryViewParticipants/MaxGalleryViewParticipants';
import { useKrispToggle } from '../../hooks/useKrispToggle/useKrispToggle';
import SmallCheckIcon from '../../icons/SmallCheckIcon';
import InfoIconOutlined from '../../icons/InfoIconOutlined';
import KrispLogo from '../../icons/KrispLogo';
import { useAppState } from '../../state';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: '600px',
    minHeight: '400px',
    [theme.breakpoints.down('xs')]: {
      width: 'calc(100vw - 32px)',
    },
    '& .inputSelect': {
      width: 'calc(100% - 35px)',
    },
  },
  button: {
    float: 'right',
  },
  paper: {
    [theme.breakpoints.down('xs')]: {
      margin: '16px',
    },
  },
  headline: {
    marginBottom: '0.3em',
    fontSize: '1.1rem',
  },
  listSection: {
    margin: '0em 0 0.1em',
    '&:first-child': {
      margin: '0em 0 0em 0',
    },
  },
  noiseCancellationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  krispContainer: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      '&:not(:last-child)': {
        margin: '0 0.3em',
      },
    },
  },
  krispInfoText: {
    margin: '0 0 1.5em 0.5em',
  },
}));

export default function DeviceSelectionDiv() {
  const { isAcquiringLocalTracks } = useVideoContext();
  const { isKrispEnabled, isKrispInstalled } = useAppState();
  const { toggleKrisp } = useKrispToggle();
  const classes = useStyles();

  return (
    <>
      <div className={classes.listSection}>
        <VideoInputList />
      </div>

      <div className={classes.listSection}>
        <AudioInputList />
      </div>
      <div className={classes.listSection}>
        <AudioOutputList />
      </div>
    </>
  );
}
