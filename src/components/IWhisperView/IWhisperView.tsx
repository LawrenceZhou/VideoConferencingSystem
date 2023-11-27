import React, { useEffect, useRef } from 'react';
import BackgroundSelectionDialog from '../BackgroundSelectionDialog/BackgroundSelectionDialog';
import ChatWindow from '../ChatWindow/ChatWindow';
import clsx from 'clsx';
import { NonverbalView } from '../NonverbalView/NonverbalView';
import { GalleryView } from '../GalleryView/GalleryView';
import { MobileGalleryView } from '../MobileGalleryView/MobileGalleryView';
import MainParticipant from '../MainParticipant/MainParticipant';
import { makeStyles, Theme, useMediaQuery, useTheme, createStyles } from '@material-ui/core';
import Participant from '../Participant/Participant';
import { Room as IRoom } from 'twilio-video';
import { ParticipantAudioTracks } from '../ParticipantAudioTracks/ParticipantAudioTracks';
import ParticipantList from '../ParticipantList/ParticipantList';
import { GALLERY_VIEW_ASPECT_RATIO, GALLERY_VIEW_MARGIN } from '../../constants';
import { useAppState } from '../../state';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Box, Grid } from 'grommet';
import usePublications from '../../hooks/usePublications/usePublications';
import { Participant as PT } from 'twilio-video';
import { VideoRoomMonitor } from '@twilio/video-room-monitor';
import PiPWindow from '../PiPWindow/PiPWindow';
//import usePiPContext from '../PiPProvider/PiPProvider';
//import usePiPContext from '../../hooks/usePiPContext/usePiPContext';
import VideoTrack from '../VideoTrack/VideoTrack';
import { LocalAudioTrack, LocalVideoTrack, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import WhisperMonitor from '../WhisperMonitor/WhisperMonitor';
import WhisperController from '../WhisperMonitor/WhisperController';
import { RecordingRule, RecordingRules, RoomType } from '../../types';

const URLs = ['https://forms.gle/yL6VBUdSvM9eUYaL7', 'https://forms.gle/1BPVYHXf7Q2kADoWA'];

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

      iframeContainer: {
        width: '100%',
        height: '100%',
        backgroud: 'rgb(255, 255, 255)',
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

export default function IWhisperView() {
  //const classes = useStyles();
  const { isChatWindowOpen, setIsChatWindowOpen } = useChatContext();
  const { isBackgroundSelectionOpen, room, isSharingScreen, isPiPSupported, pipWindow } = useVideoContext();
  const { localTracks } = useVideoContext();

  const {
    isGalleryViewActive,
    setIsGalleryViewActive,
    experimentNameG,
    conditionNameG,
    roleNameG,
    isIWhisperWindowOpen,
    setIsIWhisperWindowOpen,
    ifALessonStarted,
    updateSubscribeRules,
  } = useAppState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const screenShareParticipant = useScreenShareParticipant();
  //const {isPiPSupported, pipWindow, requestPipWindow, closePipWindow} = usePiPContext();
  const localParticipant = room!.localParticipant;
  const videoTrack = localTracks.find(
    track => !track.name.includes('screen') && track.kind === 'video'
  ) as LocalVideoTrack;
  const onClick = () => {};
  // Here we switch to speaker view when a participant starts sharing their screen, but
  // the user is still free to switch back to gallery view.
  //useSetSpeakerViewOnScreenShare(screenShareParticipant, room, setIsGalleryViewActive, isGalleryViewActive);
  useEffect(() => {
    if (
      experimentNameG === 'I-Whisper Experiment' &&
      conditionNameG === '1' &&
      roleNameG !== 'Researcher' &&
      roleNameG !== 'Teacher'
    ) {
      console.log(ifALessonStarted('notchecked'));
      const rule1: RecordingRule = { type: 'include', all: true };
      const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
      const rule3: RecordingRule = { type: 'exclude', kind: 'audio' };
      const rule4: RecordingRule = { type: 'include', kind: 'audio', publisher: 'Teacher' };
      const rules: RecordingRules = [rule1, rule2, rule3, rule4];

      updateSubscribeRules(room!.sid, roleNameG, rules);
    }
  }, []);

  if (roleNameG === 'Researcher') {
    VideoRoomMonitor.openMonitor();
    return (
      <div>
        <div
          style={{
            padding: '0px',
            gap: '10px',
            position: 'absolute',
            display: 'flex',
            margin: '0 auto',
            alignContent: 'end',
            flexWrap: 'wrap',
            justifyContent: 'end',
            zIndex: 8,
            opacity: 1.0,
          }}
        >
          <Grid
            rows={['xxsmall', 'small', 'small']}
            columns={['xsmall', 'medium', 'medium']}
            gap="small"
            areas={[
              { name: 'blank', start: [0, 0], end: [0, 0] },
              { name: 'columnTitleCamera', start: [1, 0], end: [1, 0] },
              { name: 'columnTitleScreen', start: [2, 0], end: [2, 0] },
              { name: 'rowTitleTeacher', start: [0, 1], end: [0, 1] },
              { name: 'rowTitleStudent', start: [0, 2], end: [0, 2] },
              { name: 'TeacherCamera', start: [1, 1], end: [1, 1] },
              { name: 'TeacherScreen', start: [2, 1], end: [2, 1] },
              { name: 'StudentCamera', start: [1, 2], end: [1, 2] },
              { name: 'StudentScreen', start: [2, 2], end: [2, 2] },
            ]}
          >
            <Box gridArea="blank" background="transparent" />
            <Box gridArea="columnTitleCamera" background="light-5">
              Camera
            </Box>
            <Box gridArea="columnTitleScreen" background="light-5">
              Screen
            </Box>
            <Box gridArea="rowTitleTeacher" background="light-5">
              Teacher
            </Box>
            <Box gridArea="rowTitleStudent" background="light-5">
              Student
            </Box>

            {Array.from<PT>(room!.participants.values()).map(participant => (
              <>
                <Box
                  gridArea={participant.identity + 'Camera'}
                  background="light-2"
                  width="medium"
                  height="small"
                  style={{ alignContent: 'center', justifyContent: 'center' }}
                >
                  <div
                    style={{
                      width: '80%',
                      height: 'auto',
                      position: 'relative',
                      left: '10%',
                      background: 'rgba(0, 0, 0, 0.80)',
                    }}
                  >
                    <Participant
                      participant={participant}
                      isLocalParticipant={false}
                      isDominantSpeaker={false}
                      trackToShow="camera"
                    />
                  </div>
                </Box>
                <Box
                  gridArea={participant.identity + 'Screen'}
                  background="light-2"
                  width="medium"
                  height="small"
                  style={{ alignContent: 'center', justifyContent: 'center' }}
                >
                  <div
                    style={{
                      width: '80%',
                      height: 'auto',
                      position: 'relative',
                      left: '10%',
                      background: 'rgba(0, 0, 0, 0.80)',
                    }}
                  >
                    <Participant
                      participant={participant}
                      isLocalParticipant={false}
                      isDominantSpeaker={false}
                      trackToShow="screen"
                    />
                  </div>
                </Box>
              </>
            ))}
          </Grid>
        </div>
      </div>
    );
  }
  VideoRoomMonitor.openMonitor();

  return (
    <>
      <MainParticipant />
      <ParticipantList />

      {isPiPSupported ? (
        pipWindow ? (
          <PiPWindow pipWindow={pipWindow}>
            <div
              style={{
                background: 'black',
                flex: 1,
                textAlign: 'center',
                width: '100%',
                height: '40%',
              }}
            >
              <Participant
                key={localParticipant.sid}
                participant={localParticipant}
                isSelected={false}
                onClick={onClick}
                hideParticipant={false}
                trackToShow="camera"
              />
            </div>
            <div
              style={{
                background: 'black',
                padding: '5px',
                flex: 1,
                textAlign: 'start',
                width: '100%',
                height: '30%',
              }}
            >
              <WhisperMonitor />
            </div>
            <div
              style={{
                background: 'white',
                padding: '5px',
                flex: 1,
                textAlign: 'start',
                width: '100%',
                height: '30%',
              }}
            >
              <WhisperController />
            </div>
          </PiPWindow>
        ) : null
      ) : (
        <div className="error">Document Picture-in-Picture is not supported in this browser</div>
      )}
    </>
  );
}
