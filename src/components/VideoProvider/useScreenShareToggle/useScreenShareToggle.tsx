import { useState, useCallback, useRef, createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { LogLevels, Track, Room, LocalVideoTrack, LocalAudioTrack } from 'twilio-video';
import { ErrorCallback } from '../../../types';
import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
//import usePiPContext from '../../../hooks/usePiPContext/usePiPContext';
import { createPortal } from 'react-dom';

interface MediaStreamTrackPublishOptions {
  name?: string;
  priority: Track.Priority;
  logLevel: LogLevels;
}

export default function useScreenShareToggle(
  room: Room | null,
  onError: ErrorCallback,
  localTracks: (LocalAudioTrack | LocalVideoTrack)[],
  removeScreenVideoTrack: () => void,
  setScreenTrack: (screenTrack: LocalVideoTrack) => void
) {
  const [isSharing, setIsSharing] = useState(false);
  const stopScreenShareRef = useRef<() => void>(null!);
  const { roleNameG, experimentNameG, conditionNameG } = useAppState();
  const { isPiPWindowOpen, setIsPiPWindowOpen } = useAppState();
  const isPiPSupported = 'documentPictureInPicture' in window;

  // Expose pipWindow that is currently active
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  //const PiPContext = createContext<IPiPContext | undefined>(undefined);

  useEffect(() => {
    if (isSharing) {
      requestPipWindow(240, 180);
    } else {
      closePipWindow();
    }
  }, [isSharing]);

  const closePipWindow = () => {
    if (pipWindow != null) {
      pipWindow.close();
      setPipWindow(null);
    }
  };

  const requestPipWindow = async (width: number, height: number) => {
    // We don't want to allow multiple requests.
    if (pipWindow != null) {
      return;
    }

    const pip = await window.documentPictureInPicture.requestWindow({
      width,
      height,
    });

    // Detect when window is closed by user
    pip.addEventListener('pagehide', () => {
      setPipWindow(null);
    });

    // It is important to copy all parent widnow styles. Otherwise, there would be no CSS available at all
    // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/#copy-style-sheets-to-the-picture-in-picture-window
    [...document.styleSheets].forEach(styleSheet => {
      try {
        const cssRules = [...styleSheet.cssRules].map(rule => rule.cssText).join('');
        const style = document.createElement('style');

        style.textContent = cssRules;
        pip.document.head.appendChild(style);
      } catch (e) {
        const link = document.createElement('link');
        if (styleSheet.href == null) {
          return;
        }

        link.rel = 'stylesheet';
        link.type = styleSheet.type;
        link.media = styleSheet.media.toString();
        link.href = styleSheet.href;
        pip.document.head.appendChild(link);
      }
    });

    setPipWindow(pip);
  };

  const localParticipant = room?.localParticipant;

  const toggleScreenShare = useCallback(() => {
    const screenTrack = localTracks.find(track => track.name.includes('screen') && track.kind === 'video') as
      | LocalVideoTrack
      | undefined;

    //togglePiP();
    if (isSharing && screenTrack) {
      const screenTrackPublication = localParticipant?.unpublishTrack(screenTrack!);
      // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
      localParticipant?.emit('trackUnpublished', screenTrackPublication);
      removeScreenVideoTrack();
      setIsSharing(false);
    } else {
      setIsSharing(true);
      const constraints = {
        audio: false,
        video: true,
        //preferCurrentTab: true,
        //video: {displaySurface: `window`},
        //name: `screen-${Date.now()}`,
      };

      navigator.mediaDevices
        .getDisplayMedia(constraints as MediaStreamConstraints)
        .then(stream => {
          const track = stream.getTracks()[0];
          console.log('here!!!!');
          track.onended = function() {
            setIsSharing(false);
            const screenTrackPublication = localParticipant?.unpublishTrack(track);
            // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
            localParticipant?.emit('trackUnpublished', screenTrackPublication);
            removeScreenVideoTrack();
            //setIsSharing(false);
            //if(pipWindow){
            //closePipWindow();

            //}else{
            //console.log("open it 2");
            //startPiP();
            //pipScreenforIWhisper();
            //}
            // doWhatYouNeedToDo();
          };
          localParticipant
            ?.publishTrack(track, {
              name: `screen-${Date.now()}`, // Tracks can be named to easily find them later
              priority: experimentNameG === 'IWhisper Experiment' ? 'low' : 'high', // Priority is set to high by the subscriber when the video track is rendered
            } as MediaStreamTrackPublishOptions)
            .then(trackPublication => {
              setScreenTrack(new LocalVideoTrack(track));
              localParticipant?.emit('trackPublished', trackPublication);
              //setIsSharing(true);
              //requestPipWindow(240, 135);
              //if(!pipWindow){

              //console.log("open it 2");
              //startPiP();
              //pipScreenforIWhisper();
              //}
            })
            .catch(error => {
              setIsSharing(false);
              onError(error);
            });
        })
        .catch(error => {
          // Don't display an error if the user closes the screen share dialog
          setIsSharing(false);

          if (
            error.message === 'Permission denied by system' ||
            (error.name !== 'AbortError' && error.name !== 'NotAllowedError')
          ) {
            console.error(error);
            onError(error);
          }
        });
    }

    //}, [room, onError,localTracks, setScreenTrack, isPiPSupported, requestPipWindow, pipWindow, closePipWindow, startPiP]);
  }, [room, onError, localTracks, setScreenTrack]);

  //const toggleScreenShare = useCallback(() => {
  //  shareScreen();
  //}, [isSharing, shareScreen, room]);

  /*const value =useMemo(() => {
    {
      return {
      isSharing, 
      toggleScreenShare,
        isPiPSupported,
        pipWindow,
        //requestPipWindow,
        //closePipWindow,
      };
    }
  //}, [isSharing, toggleScreenShare,closePipWindow, isPiPSupported, pipWindow, requestPipWindow]);
  }, [isSharing, toggleScreenShare, isPiPSupported, pipWindow, togglePiP]);*/

  return [isSharing, toggleScreenShare, isPiPSupported, pipWindow, requestPipWindow, closePipWindow] as const;
  //return value;
}
