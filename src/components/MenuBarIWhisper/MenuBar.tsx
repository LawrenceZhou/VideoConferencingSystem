import React, { useCallback } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import OpenPiPButton from '../Buttons/OpenPiPButton/OpenPiPButton';
import { isMobile } from '../../utils';
import Menu from './Menu/Menu';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Typography, Grid, Hidden } from '@material-ui/core';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleIWhisperButton from '../Buttons/ToggleIWhisperButton/ToggleIWhisperButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import ToggleScreenShareButton from '../Buttons/ToggleScreenShareButton/ToggleScreenShareButton';
import { useAppState } from '../../state';
import Divider from '@material-ui/core/Divider';
import useChatContext from '../../hooks/useChatContext/useChatContext';
/*
import usePiPWindowContext from '../../hooks/usePiPWindow/usePiPWindow';
import PiPWindow from '../VideoProvider/useScreenShareToggle/PiPWindow';
import ParticipantInfo from '../ParticipantInfo/ParticipantInfo';
import ParticipantTracks from '../ParticipantTracks/ParticipantTracks';*/

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${theme.footerHeight}px`,
      position: 'fixed',
      display: 'flex',
      padding: '0 0.43em',
      zIndex: 10,
      [theme.breakpoints.down('sm')]: {
        height: `${theme.mobileFooterHeight}px`,
        padding: 0,
      },
    },
    screenShareBanner: {
      position: 'fixed',
      zIndex: 8,
      bottom: `${theme.footerHeight}px`,
      left: 0,
      right: 0,
      height: '104px',
      background: 'rgba(0, 0, 0, 0.5)',
      '& h6': {
        color: 'white',
      },
      '& button': {
        background: 'white',
        color: theme.brand,
        border: `2px solid ${theme.brand}`,
        margin: '0 2em',
        '&:hover': {
          color: '#600101',
          border: `2px solid #600101`,
          background: '#FFE9E7',
        },
      },
    },
    hideMobile: {
      display: 'initial',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    iconContainer: {
      padding: '0.05em 0.05em',
      display: 'flex',
      '& svg': {
        transform: 'scale(1.5)',
      },
    },
  })
);

export default function MenuBarIWhisper() {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare, pipWindow } = useVideoContext();
  const { conditionNameG, roleNameG, experimentNameG, isIWhisperWindowOpen } = useAppState();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const { room } = useVideoContext();
  const participants = useParticipants();
  const { isChatWindowOpen, setIsChatWindowOpen, conversation, hasUnreadMessages } = useChatContext();

  const logoWidth = isChatWindowOpen || isIWhisperWindowOpen ? '320px' : '0px';
  const controlWidth = isChatWindowOpen ? window.innerWidth - 320 : window.innerWidth;
  const logoDisplay = isChatWindowOpen || isIWhisperWindowOpen ? 'block' : 'none';
  //const { } = usePiPWindowContext();

  return (
    <footer className={classes.container}>
      <div
        className="control"
        style={{
          width: controlWidth,
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.5em',
        }}
      >
        <div style={{ display: 'flex' }}>
          <ToggleAudioButton disabled={isReconnecting} className={classes.iconContainer} />
          <ToggleVideoButton disabled={isReconnecting} className={classes.iconContainer} />

          <Menu />
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          {isSharingScreen && !pipWindow && <OpenPiPButton />}
          {!isMobile && (
            <ToggleScreenShareButton disabled={isReconnecting || room!.localParticipant.identity !== 'Teacher'} />
          )}
          {conditionNameG === '2' && process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true' && (
            <ToggleChatButton />
          )}
          {conditionNameG === '1' && <ToggleIWhisperButton />}
        </div>

        <div style={{ display: 'flex' }}>
          <EndCallButton />
        </div>
      </div>

      <div className="title" style={{ width: 320, display: logoDisplay, paddingLeft: 30 }}>
        <Typography variant="h6">
          <strong>{experimentNameG}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Condition {conditionNameG} | {roleNameG}
        </Typography>
      </div>
    </footer>
  );
}
