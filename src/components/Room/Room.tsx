import React, { useEffect, useRef } from 'react';
import BackgroundSelectionDialog from '../BackgroundSelectionDialog/BackgroundSelectionDialog';
import ChatWindow from '../ChatWindow/ChatWindow';
import IWhisperWindow from '../IWhisperWindow/IWhisperWindow';
import clsx from 'clsx';
import { NonverbalView } from '../NonverbalView/NonverbalView';
import IWhisperView from '../IWhisperView/IWhisperView';
import { GalleryView } from '../GalleryView/GalleryView';
import { MobileGalleryView } from '../MobileGalleryView/MobileGalleryView';
import MainParticipant from '../MainParticipant/MainParticipant';
import { makeStyles, Theme, useMediaQuery, useTheme } from '@material-ui/core';
import Participant from '../Participant/Participant';
import { Room as IRoom } from 'twilio-video';
import { ParticipantAudioTracks } from '../ParticipantAudioTracks/ParticipantAudioTracks';
import ParticipantList from '../ParticipantList/ParticipantList';

import { useAppState } from '../../state';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) => {
  const totalMobileSidebarHeight = `${theme.sidebarMobileHeight +
    theme.sidebarMobilePadding * 2 +
    theme.participantBorderWidth}px`;
  return {
    container: {
      position: 'relative',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: `1fr ${theme.sidebarNewWidth}px`,
      gridTemplateRows: '100%',
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: `100%`,
        gridTemplateRows: `calc(100% - ${totalMobileSidebarHeight}) ${totalMobileSidebarHeight}`,
      },
    },
    rightDrawerOpen: { gridTemplateColumns: `1fr ${theme.sidebarNewWidth}px ${theme.rightDrawerWidth}px` },
  };
});

/**
 * This hook turns on speaker view when screensharing is active, regardless of if the
 * user was already using speaker view or gallery view. Once screensharing has ended, the user's
 * view will return to whatever they were using prior to screenshare starting.
 */

export function useSetSpeakerViewOnScreenShare(
  screenShareParticipant: typeof Participant | undefined,
  room: IRoom | null,
  setIsGalleryViewActive: React.Dispatch<React.SetStateAction<boolean>>,
  isGalleryViewActive: boolean
) {
  const isGalleryViewActiveRef = useRef(isGalleryViewActive);

  // Save the user's view setting whenever they change to speaker view or gallery view:
  useEffect(() => {
    isGalleryViewActiveRef.current = isGalleryViewActive;
  }, [isGalleryViewActive]);
}

export default function Room() {
  const classes = useStyles();
  const { isChatWindowOpen } = useChatContext();
  const { isBackgroundSelectionOpen, room } = useVideoContext();
  const {
    isGalleryViewActive,
    setIsGalleryViewActive,
    experimentNameG,
    conditionNameG,
    roleNameG,
    isIWhisperWindowOpen,
  } = useAppState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const screenShareParticipant = useScreenShareParticipant();

  // Here we switch to speaker view when a participant starts sharing their screen, but
  // the user is still free to switch back to gallery view.
  //useSetSpeakerViewOnScreenShare(screenShareParticipant, room, setIsGalleryViewActive, isGalleryViewActive);

  return (
    <div
      className={clsx(classes.container, {
        [classes.rightDrawerOpen]: isChatWindowOpen || isBackgroundSelectionOpen || isIWhisperWindowOpen,
      })}
    >
      {/* 
        This ParticipantAudioTracks component will render the audio track for all participants in the room.
        It is in a separate component so that the audio tracks will always be rendered, and that they will never be 
        unnecessarily unmounted/mounted as the user switches between Gallery View and speaker View.
      */}
      <ParticipantAudioTracks />

      {experimentNameG === 'Nonverbal Cues Experiment' ? <NonverbalView /> : null}

      {experimentNameG === 'I-Whisper Experiment' ? <IWhisperView /> : null}
      {experimentNameG === 'I-Whisper Experiment' ? conditionNameG === '1' ? <IWhisperWindow /> : <ChatWindow /> : null}

      <BackgroundSelectionDialog />
    </div>
  );
}
