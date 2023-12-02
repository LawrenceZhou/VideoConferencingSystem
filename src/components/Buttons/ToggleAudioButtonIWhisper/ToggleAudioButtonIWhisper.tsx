import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { Grommet, Tip, Box, Text, grommet, Stack } from 'grommet';
import Snackbar from '../../Snackbar/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import NewReleasesOutlinedIcon from '@material-ui/icons/NewReleasesOutlined';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useAppState, IWhisperEventType } from '../../../state';

import { User } from 'grommet-icons';

import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: 3999,
      color: '#fff',
    },

    iconContainer: {
      position: 'relative',
      fontSize: '12px',
      display: 'flex',
      '& svg': {
        transform: 'scale(0.2)',
      },
    },
  })
);

export default function ToggleAudioButtonIWhisper(props: { disabled?: boolean; className?: string }) {
  const classes = useStyles();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks, room, pipWindow } = useVideoContext();
  const hasAudioTrack = localTracks.some(track => track.kind === 'audio');
  const [audioReminder, setAudioReminder] = useState<string>('');
  const [open, setOpen] = React.useState(false);
  const {
    isIWhisperedBy,
    setIsIWhisperedBy,
    eventHistory,
    setEventHistory,
    syncClient,
    toggleAudio,
    whisperState,
    isBackdropOpen,
    setIsBackdropOpen,
    gotAWhisperWhenIWWindowClosed,
    nameTable,
  } = useAppState();

  const handleClose = () => {
    setIsBackdropOpen(false);
  };

  const handleToggle = () => {
    if (!isAudioEnabled) {
      if (whisperState.state === 'IDLE') {
        toggleAudio(room!.sid, room!.localParticipant.identity, 'enable', 'notInWhisper', '');
      } else {
        toggleAudio(room!.sid, room!.localParticipant.identity, 'enable', 'inWhisper', whisperState.subject);
      }
      /*setTimeout(() => {
        setOpen(false);
      }, 2000);*/
    } else {
      if (whisperState.state === 'IDLE') {
        toggleAudio(room!.sid, room!.localParticipant.identity, 'disable', 'notInWhisper', '');
      } else {
        toggleAudio(room!.sid, room!.localParticipant.identity, 'disable', 'inWhisper', whisperState.subject);
      }
    }
    //setOpen(!open);
    toggleAudioEnabled();
  };

  return (
    <>
      {!pipWindow && (
        <Backdrop className={classes.backdrop} open={isBackdropOpen} onClick={handleClose}>
          {!isAudioEnabled && (
            <Box
              background="transparent"
              direction="row"
              pad="small"
              gap="small"
              round="xsmall"
              style={{
                position: 'absolute',
                left: 10,
                bottom: 75,
              }}
            >
              <Alert severity="info">Your mic is off</Alert>
            </Box>
          )}

          {gotAWhisperWhenIWWindowClosed && (
            <Box
              background="transparent"
              direction="row"
              pad="small"
              gap="small"
              round="xsmall"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 75,
              }}
            >
              <Alert severity="info">
                {nameTable!.find(n => n.role === whisperState.subject)!.name} is whispering to you
              </Alert>
            </Box>
          )}
        </Backdrop>
      )}

      <Button
        className={props.className}
        onClick={handleToggle}
        disabled={!hasAudioTrack || props.disabled}
        startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
        data-cy-audio-toggle
      >
        <Box pad={{ top: '10px' }} margin={{ left: '-10px' }} width="10px" height="10px">
          {whisperState.state !== 'IDLE' ? <User size="10px" /> : null}
        </Box>
        {/*!hasAudioTrack ? 'No Audio' : isAudioEnabled ? 'Mute' : 'Unmute'*/}
      </Button>
    </>
  );
}
