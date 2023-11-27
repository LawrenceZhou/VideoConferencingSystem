import React, { createContext, ReactNode, useCallback, useState, useMemo } from 'react';
import { CreateLocalTrackOptions, ConnectOptions, LocalAudioTrack, LocalVideoTrack, Room } from 'twilio-video';
import { ErrorCallback } from '../../types';
import { SelectedParticipantProvider } from './useSelectedParticipant/useSelectedParticipant';

import AttachVisibilityHandler from './AttachVisibilityHandler/AttachVisibilityHandler';
import useBackgroundSettings, { BackgroundSettings } from './useBackgroundSettings/useBackgroundSettings';
import useHandleRoomDisconnection from './useHandleRoomDisconnection/useHandleRoomDisconnection';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useLocalTracks from './useLocalTracks/useLocalTracks';
import useRestartAudioTrackOnDeviceChange from './useRestartAudioTrackOnDeviceChange/useRestartAudioTrackOnDeviceChange';
import useRoom from './useRoom/useRoom';
import useScreenShareToggle from './useScreenShareToggle/useScreenShareToggle';
import { useAppState } from '../../state';
//import usePiPWindow from './useScreenShareToggle/PiPProvider';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IVideoContext {
  room: Room | null;
  localTracks: (LocalAudioTrack | LocalVideoTrack)[];
  isConnecting: boolean;
  connect: (token: string) => Promise<void>;
  onError: ErrorCallback;
  getLocalVideoTrack: (newOptions?: CreateLocalTrackOptions) => Promise<LocalVideoTrack>;
  isAcquiringLocalTracks: boolean;
  removeLocalVideoTrack: () => void;
  isSharingScreen: boolean;
  toggleScreenShare: () => void;
  getAudioAndVideoTracks: () => Promise<void>;
  isBackgroundSelectionOpen: boolean;
  setIsBackgroundSelectionOpen: (value: boolean) => void;
  backgroundSettings: BackgroundSettings;
  setBackgroundSettings: (settings: BackgroundSettings) => void;
  //makeNewLocalVideoTrack: (newOptions?: CreateLocalTrackOptions) => Promise<LocalVideoTrack>;
  extraLocalVideoTrack: LocalVideoTrack | undefined;
  getScreenVideoTrack: (newOptions?: CreateLocalTrackOptions) => Promise<LocalVideoTrack>;
  isPiPSupported: boolean;
  pipWindow: Window | null;
  requestPipWindow: (width: number, height: number) => Promise<void>;
  closePipWindow: () => void;
}

export const VideoContext = createContext<IVideoContext>(null!);

interface VideoProviderProps {
  options?: ConnectOptions;
  onError: ErrorCallback;
  children: ReactNode;
}

export function VideoProvider({ options, children, onError = () => {} }: VideoProviderProps) {
  const onErrorCallback: ErrorCallback = useCallback(
    error => {
      console.log(`ERROR: ${error.message}`, error);
      onError(error);
    },
    [onError]
  );

  const {
    extraLocalVideoTrack,
    setScreenTrack,
    getScreenVideoTrack,
    localTracks,
    getLocalVideoTrack,
    isAcquiringLocalTracks,
    removeLocalAudioTrack,
    removeLocalVideoTrack,
    removeScreenVideoTrack,
    getAudioAndVideoTracks,
  } = useLocalTracks();
  const { room, isConnecting, connect } = useRoom(localTracks, onErrorCallback, options);

  const [
    isSharing,
    toggleScreenShare,
    isPiPSupported,
    pipWindow,
    requestPipWindow,
    closePipWindow,
  ] = useScreenShareToggle(room, onError, localTracks, removeScreenVideoTrack, setScreenTrack);
  const isSharingScreen = isSharing;

  // Register callback functions to be called on room disconnect.
  useHandleRoomDisconnection(
    room,
    onError,
    removeLocalAudioTrack,
    removeLocalVideoTrack,
    isSharingScreen,
    toggleScreenShare,
    removeScreenVideoTrack
  );
  useHandleTrackPublicationFailed(room, onError);
  useRestartAudioTrackOnDeviceChange(localTracks);

  const [isBackgroundSelectionOpen, setIsBackgroundSelectionOpen] = useState(false);

  const videoTrack = localTracks.find(track => track.name.includes('camera') && track.kind === 'video') as
    | LocalVideoTrack
    | undefined;
  const [backgroundSettings, setBackgroundSettings] = useBackgroundSettings('transparent', videoTrack, room);
  //const [backgroundSettings, setBackgroundSettings] = useBackgroundSettings('transparent' , extraLocalVideoTrack, room);

  //const [backgroundSettings, setBackgroundSettings] = useBackgroundSettings(videoTrack, room, experimentNameG, conditionNameG, roleNameG);

  return (
    <VideoContext.Provider
      value={{
        room,
        localTracks,
        isConnecting,
        onError: onErrorCallback,
        getLocalVideoTrack,
        connect,
        isAcquiringLocalTracks,
        removeLocalVideoTrack,
        isSharingScreen,
        toggleScreenShare,
        getAudioAndVideoTracks,
        isBackgroundSelectionOpen,
        setIsBackgroundSelectionOpen,
        backgroundSettings,
        setBackgroundSettings,
        //makeNewLocalVideoTrack,
        extraLocalVideoTrack,
        getScreenVideoTrack,
        isPiPSupported,
        pipWindow,
        requestPipWindow,
        closePipWindow,
      }}
    >
      <SelectedParticipantProvider room={room}>{children}</SelectedParticipantProvider>
      {/* 
        The AttachVisibilityHandler component is using the useLocalVideoToggle hook
        which must be used within the VideoContext Provider.
      */}
      <AttachVisibilityHandler />
    </VideoContext.Provider>
  );
}
