import React, { useCallback, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import ScreenShareIcon from '../../../icons/ScreenShareIcon';
import Tooltip from '@material-ui/core/Tooltip';
//import ScreenShareIcon from '@mui/icons-material/ScreenShare';
//import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
//import usePiPContext from '../../PiPProvider/PiPProvider';
import PiPWindow from '../../PiPWindow/PiPWindow';
import MainParticipant from '../../MainParticipant/MainParticipant';
//import usePiPContext from '../../../hooks/usePiPContext/usePiPContext';
//import PiPWindow from '../../VideoProvider/useScreenShareToggle/PiPWindow';
import ParticipantInfo from '../../ParticipantInfo/ParticipantInfo';
import ParticipantTracks from '../../ParticipantTracks/ParticipantTracks';
import VideoTrack from '../../VideoTrack/VideoTrack';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import ParticipantList from '../../ParticipantList/ParticipantList';
import { useAppState } from '../../../state';

export const SCREEN_SHARE_TEXT = 'Share Screen';
export const STOP_SCREEN_SHARE_TEXT = 'Is Sharing Screen';
export const SHARE_IN_PROGRESS_TEXT = 'Cannot share screen when another user is sharing';
//export const SHARE_NOT_SUPPORTED_TEXT = 'Screen sharing is not supported with this browser';
export const SHARE_NOT_SUPPORTED_TEXT = 'Share Screen Not Allowed';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      background: '#00C781',
      color: 'white',
      '&:hover': {
        background: '#00873D',
      },
    },
  })
);

export default function ToggleScreenShareButton(props: { disabled?: boolean; className?: string }) {
  const classes = useStyles();
  const screenShareParticipant = useScreenShareParticipant();
  const { isSharingScreen, toggleScreenShare, room, localTracks } = useVideoContext();
  //const { isSharingScreen, toggleScreenShare, room, localTracks, isPiPSupported, requestPipWindow, pipWindow, closePipWindow } = useVideoContext();
  //const disableScreenShareButton = Boolean(screenShareParticipant);
  const disableScreenShareButton = false;
  const isScreenShareSupported = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  const isDisabled = props.disabled || disableScreenShareButton || !isScreenShareSupported;
  //const { isPiPSupported,  pipWindow } = usePiPContext();
  //const {isPiPSupported, pipWindow, requestPipWindow, closePipWindow} = usePiPContext();
  //const x = usePiPContext();
  //console.log(x);

  const newToggleScreenShare = function() {
    toggleScreenShare();
    //if(isPiPWindowOpen){

    //}else{
    //  setIsPiPWindowOpen(true);
    //}
    //console.log("first entry", pipWindow);
  };

  const videoTrack = localTracks.find(
    track => !track.name.includes('screen') && track.kind === 'video'
  ) as LocalVideoTrack;

  console.log(isDisabled);
  return (
    <>
      <Button
        className={clsx(classes.button, props.className)}
        onClick={() => newToggleScreenShare()}
        disabled={isDisabled || isSharingScreen}
        data-cy-share-screen
      >
        {isDisabled ? SHARE_NOT_SUPPORTED_TEXT : !isSharingScreen ? SCREEN_SHARE_TEXT : STOP_SCREEN_SHARE_TEXT}
      </Button>
    </>
  );
}
