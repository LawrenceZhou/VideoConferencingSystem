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
import IWhisperMonitor from '../IWhisperMonitor/IWhisperMonitor';
import IWhisperController from '../IWhisperMonitor/IWhisperController';
import { RecordingRule, RecordingRules, RoomType } from '../../types';
import MicIcon from '../../icons/MicIcon';
import Menu from '../MenuBarIWhisper/Menu/Menu';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleAudioButtonIWhisper from '../Buttons/ToggleAudioButtonIWhisper/ToggleAudioButtonIWhisper';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleIWhisperButton from '../Buttons/ToggleIWhisperButton/ToggleIWhisperButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import useRoomState from '../../hooks/useRoomState/useRoomState';

export interface IWhisperEventType {
  id: string;
  category: string;
  timestamp: number;
  from: string;
  to: string;
}

export interface SetPropertyType {
  id: string;
  property: string;
  timestamp: number;
}

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
    },
    iframeContainer: {
      width: '100%',
      height: '100%',
      backgroud: 'rgb(255, 255, 255)',
    },

    iconContainer: {
      padding: '0.05em 0.05em',
      display: 'flex',
      '& svg': {
        transform: 'scale(1.5)',
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
  const classes = useStyles();
  const { isChatWindowOpen, setIsChatWindowOpen } = useChatContext();
  const {
    isBackgroundSelectionOpen,
    room,
    isSharingScreen,
    isPiPSupported,
    pipWindow,
    localTracks,
  } = useVideoContext();
  const roomState = useRoomState();

  const isReconnecting = roomState === 'reconnecting';
  const {
    isGalleryViewActive,
    setIsGalleryViewActive,
    experimentNameG,
    conditionNameG,
    roleNameG,
    isIWhisperWindowOpen,
    setIsIWhisperWindowOpen,
    syncClient,
    eventHistory,
    setEventHistory,
    propertyHistory,
    setPropertyHistory,
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
    if (conditionNameG === '1') {
      if (syncClient) {
        syncClient.list('whisperActionList').then(list => {
          list.on('itemAdded', e => {
            //setActions((actions) => actions.concat(e.item.data.value.action));
            //console.log(e.item.data)
            let timestamp = Date.now();
            let lastEvent = null;
            if (e.item.data.action !== 'setProperty') {
              if (eventHistory && eventHistory.length > 0 && eventHistory[eventHistory.length - 1]) {
                lastEvent = eventHistory[eventHistory.length - 1];
                if (
                  lastEvent.from === e.item.data.from &&
                  lastEvent.to === e.item.data.to &&
                  lastEvent.category === e.item.data.action &&
                  Math.abs(lastEvent.timestamp - timestamp) < 1000
                ) {
                  //nothing
                } else {
                  let newEvent = {
                    category: e.item.data.action,
                    timestamp: timestamp,
                    from: e.item.data.from,
                    to: e.item.data.to,
                    id: e.item.data.id,
                  } as IWhisperEventType;
                  console.log('event, ', newEvent);
                  setEventHistory([...eventHistory, newEvent]);
                }
              } else {
                let newEvent = {
                  category: e.item.data.action,
                  timestamp: timestamp,
                  from: e.item.data.from,
                  to: e.item.data.to,
                  id: e.item.data.id,
                } as IWhisperEventType;
                console.log('event, ', newEvent);

                setEventHistory([...eventHistory, newEvent]);
              }
            }

            let lastProperty = null;
            if (e.item.data.action === 'setProperty') {
              if (propertyHistory && propertyHistory.length > 0 && propertyHistory[propertyHistory.length - 1]) {
                lastProperty = propertyHistory[propertyHistory.length - 1];
                if (lastProperty.id === e.item.data.id && Math.abs(lastProperty.timestamp - timestamp) < 1000) {
                  //do nthing
                } else {
                  let newSetProperty = {
                    id: e.item.data.id,
                    timestamp: timestamp,
                    property: e.item.data.property,
                  } as SetPropertyType;
                  console.log(newSetProperty);
                  setPropertyHistory([...propertyHistory, newSetProperty]);
                }
              } else {
                let newSetProperty = {
                  id: e.item.data.id,
                  timestamp: timestamp,
                  property: e.item.data.property,
                } as SetPropertyType;
                console.log(newSetProperty);
                setPropertyHistory([...propertyHistory, newSetProperty]);
              }
            }

            if (e.item.data.action == 'whisperStart') {
              /*let newEvent = {category: e.item.data.action, timestamp: timestamp, from: e.item.data.from, to: e.item.data.to} as IWhisperEventType;
                            setEventHistory([...eventHistory, newEvent]);
                            console.log("whisperStart, from: ", e.item.data.from, ", to: ", e.item.data.to, roleNameG);
                            if (e.item.data.to === roleNameG){
                              //setIsIWhispered(true);
                              console.log("1st dgfdg");
                              setIsIWhisperedBy(e.item.data.from);

                            }*/
            }

            if (e.item.data.action == 'whisperEnd') {
              /*let newEvent = {category: e.item.data.action, timestamp: timestamp, from: e.item.data.from, to: e.item.data.to} as IWhisperEventType;
                            setEventHistory([...eventHistory, newEvent]);
                            console.log("whisperEnd, from: ", e.item.data.from, ", to: ", e.item.data.to, ", to: ",roleNameG);
                        if (e.item.data.to === roleNameG){
                              //etIsIWhispered(false);
                              setIsIWhisperedBy("");
                            }*/
            }
          });
        });
      }
    }
  }, [syncClient]);

  if (roleNameG === 'Researcher') {
    VideoRoomMonitor.openMonitor();
    return (
      <>
        <MainParticipant />
        <ParticipantList />
      </>
    );
  }

  return (
    <>
      <MainParticipant />
      <ParticipantList />

      {roleNameG === 'Teacher' && isPiPSupported ? (
        pipWindow ? (
          <PiPWindow pipWindow={pipWindow}>
            <div style={{ display: roleNameG !== 'Teacher' ? 'flex' : 'none' }}>
              <ToggleAudioButtonIWhisper disabled={isReconnecting} className={classes.iconContainer} />:
            </div>

            <div
              style={{
                background: 'black',
                flex: 1,
                textAlign: 'center',
                width: '100%',
                height: '50%',
                display: roleNameG === 'Teacher' ? 'block' : 'none',
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
                height: '50%',
                display: roleNameG === 'Teacher' ? 'block' : 'none',
              }}
            >
              <IWhisperMonitor />
            </div>
          </PiPWindow>
        ) : null
      ) : (
        <div className="error">Document Picture-in-Picture is not supported in this browser</div>
      )}
    </>
  );
}
