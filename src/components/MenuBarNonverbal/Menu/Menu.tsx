import React, { useState, useRef, useCallback } from 'react';
import AboutDialog from '../../AboutDialog/AboutDialog';
import BackgroundIcon from '../../../icons/BackgroundIcon';
import CollaborationViewIcon from '@material-ui/icons/AccountBox';
import DeviceSelectionDialog from '../../DeviceSelectionDialog/DeviceSelectionDialog';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GridViewIcon from '@material-ui/icons/Apps';
import InfoIconOutlined from '../../../icons/InfoIconOutlined';
import MoreIcon from '@material-ui/icons/MoreVert';
import StartRecordingIcon from '../../../icons/StartRecordingIcon';
import StopRecordingIcon from '../../../icons/StopRecordingIcon';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '../../../icons/SettingsIcon';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';
import { Button, styled, Theme, useMediaQuery, Menu as MenuContainer, MenuItem, Typography } from '@material-ui/core';
import { isSupported } from '@twilio/video-processors';
import useRoomState from '../../../hooks/useRoomState/useRoomState';
import ToggleAudioButton from '../../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../../Buttons/ToggleVideoButton/ToggleVideoButton';

import { useAppState } from '../../../state';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useIsRecording from '../../../hooks/useIsRecording/useIsRecording';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import FlipCameraIcon from '../../../icons/FlipCameraIcon';
import useFlipCameraToggle from '../../../hooks/useFlipCameraToggle/useFlipCameraToggle';
import { VideoRoomMonitor } from '@twilio/video-room-monitor';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import useDevices from '../../../hooks/useDevices/useDevices';

import { useTheme } from '@material-ui/core/styles';

export const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '1.5em',
  marginRight: '0.3em',
});

export default function Menu(props: { buttonClassName?: string }) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    isFetching,
    updateRecordingRules,
    roomType,
    setIsGalleryViewActive,
    isGalleryViewActive,
    roleNameG,
  } = useAppState();
  const { setIsChatWindowOpen } = useChatContext();
  const isRecording = useIsRecording();
  const { room, setIsBackgroundSelectionOpen } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks } = useVideoContext();
  const hasAudioTrack = localTracks.some(track => track.kind === 'audio');

  const theme = useTheme();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { flipCameraDisabled, toggleFacingMode, flipCameraSupported } = useFlipCameraToggle();
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const { hasVideoInputDevices } = useDevices();

  const toggleVideo = useCallback(() => {
    if (Date.now() - lastClickTimeRef.current > 500) {
      lastClickTimeRef.current = Date.now();
      toggleVideoEnabled();
    }
  }, [toggleVideoEnabled]);

  return (
    <>
      <Button
        onClick={() => setMenuOpen(isOpen => !isOpen)}
        ref={anchorRef}
        className={props.buttonClassName}
        data-cy-more-button
      >
        {isMobile ? (
          <MoreIcon />
        ) : (
          <>
            Settings
            <ExpandMoreIcon />
          </>
        )}
      </Button>
      <MenuContainer
        open={menuOpen}
        onClose={() => setMenuOpen(isOpen => !isOpen)}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: isMobile ? -55 : 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={toggleAudioEnabled}>
          <IconContainer>{isAudioEnabled ? <MicIcon /> : <MicOffIcon />}</IconContainer>
          <Typography variant="body1"> {!hasAudioTrack ? 'No Audio' : isAudioEnabled ? 'Mute' : 'Unmute'}</Typography>
        </MenuItem>

        <MenuItem onClick={toggleVideo}>
          <IconContainer>{isVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}</IconContainer>
          <Typography variant="body1">
            {!hasVideoInputDevices ? 'No Video' : isVideoEnabled ? 'Stop Video' : 'Start Video'}
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setSettingsOpen(true)}>
          <IconContainer>
            <SettingsIcon />
          </IconContainer>
          <Typography variant="body1">Audio and Video Settings</Typography>
        </MenuItem>

        {false && isSupported && (
          <MenuItem
            onClick={() => {
              setIsBackgroundSelectionOpen(true);
              setIsChatWindowOpen(false);
              setMenuOpen(false);
            }}
          >
            <IconContainer>
              <BackgroundIcon />
            </IconContainer>
            <Typography variant="body1">Backgrounds</Typography>
          </MenuItem>
        )}

        {flipCameraSupported && (
          <MenuItem disabled={flipCameraDisabled} onClick={toggleFacingMode}>
            <IconContainer>
              <FlipCameraIcon />
            </IconContainer>
            <Typography variant="body1">Flip Camera</Typography>
          </MenuItem>
        )}

        {roleNameG === 'Researcher' && roomType !== 'peer-to-peer' && roomType !== 'go' && (
          <MenuItem
            disabled={isFetching}
            onClick={() => {
              setMenuOpen(false);
              if (isRecording) {
                updateRecordingRules(room!.sid, [{ type: 'exclude', all: true }]);
              } else {
                updateRecordingRules(room!.sid, [{ type: 'include', all: true }]);
              }
            }}
            data-cy-recording-button
          >
            <IconContainer>{isRecording ? <StopRecordingIcon /> : <StartRecordingIcon />}</IconContainer>
            <Typography variant="body1">{isRecording ? 'Stop' : 'Start'} Recording</Typography>
          </MenuItem>
        )}

        {false && (
          <MenuItem
            onClick={() => {
              VideoRoomMonitor.toggleMonitor();
              setMenuOpen(false);
            }}
          >
            <IconContainer>
              <SearchIcon style={{ fill: '#707578', width: '0.9em' }} />
            </IconContainer>
            <Typography variant="body1">Room Monitor</Typography>
          </MenuItem>
        )}

        {false && (
          <MenuItem
            onClick={() => {
              setIsGalleryViewActive(isGallery => !isGallery);
              setMenuOpen(false);
            }}
          >
            <IconContainer>
              {isGalleryViewActive ? (
                <CollaborationViewIcon style={{ fill: '#707578', width: '0.9em' }} />
              ) : (
                <GridViewIcon style={{ fill: '#707578', width: '0.9em' }} />
              )}
            </IconContainer>
            <Typography variant="body1">{isGalleryViewActive ? 'I-Whisper View' : 'Nonverbal View'}</Typography>
          </MenuItem>
        )}

        <MenuItem onClick={() => setAboutOpen(true)}>
          <IconContainer>
            <InfoIconOutlined />
          </IconContainer>
          <Typography variant="body1">About</Typography>
        </MenuItem>
      </MenuContainer>
      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          setMenuOpen(false);
        }}
      />
      <DeviceSelectionDialog
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setMenuOpen(false);
        }}
      />
    </>
  );
}
