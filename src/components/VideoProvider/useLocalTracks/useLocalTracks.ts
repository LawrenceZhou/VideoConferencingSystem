import { DEFAULT_VIDEO_CONSTRAINTS, SELECTED_AUDIO_INPUT_KEY, SELECTED_VIDEO_INPUT_KEY } from '../../../constants';
import { getDeviceInfo, isPermissionDenied } from '../../../utils';
import { useCallback, useState, useEffect } from 'react';
import Video, {
  LocalVideoTrack,
  LocalAudioTrack,
  CreateLocalTrackOptions,
  NoiseCancellationOptions,
} from 'twilio-video';
import { useAppState } from '../../../state';

const noiseCancellationOptions: NoiseCancellationOptions = {
  sdkAssetsPath: '/noisecancellation',
  vendor: 'krisp',
};
interface HTMLMediaElementWithCaptureStream extends HTMLMediaElement {
  captureStream(): MediaStream;
}

export default function useLocalTracks() {
  const { setIsKrispEnabled, setIsKrispInstalled } = useAppState();
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack>();
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [extraLocalVideoTrack, setExtraLocalVideoTrack] = useState<LocalVideoTrack>();
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false);
  const [screenTrack, setScreenTrack] = useState<LocalVideoTrack>();

  /*useEffect(() => {
       let playVideo = document.createElement('video-tra') as HTMLMediaElementWithCaptureStream;

    playVideo.src = 'https://rotato.netlify.app/alpha-demo/movie-webm.webm';
    playVideo.autoplay = true;

    playVideo.onplay = function () {
      let stream = playVideo.captureStream();
      console.log("xxxx");
      if (stream.getVideoTracks().length > 0) {
        console.log("yyyyy");

        let videoStream = stream.getVideoTracks()[0];
        let _extraVideoTrack = new LocalVideoTrack(videoStream, {name: "video-trans"});
        setExtraVideoTrack(_extraVideoTrack);
        }
        }
     });*/

  const getLocalVideoTrack = useCallback(async () => {
    const selectedVideoDeviceId = window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY);

    const { videoInputDevices } = await getDeviceInfo();

    //const hasSelectedVideoDevice = true;
    const hasSelectedVideoDevice = videoInputDevices.some(
      device => selectedVideoDeviceId && device.deviceId === selectedVideoDeviceId
    );

    const options: CreateLocalTrackOptions = {
      ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
      name: `camera-${Date.now()}`,
      ...(hasSelectedVideoDevice && { deviceId: { exact: selectedVideoDeviceId! } }),
    };

    //Video.createLocalVideoTrack(optionsExtra).then(newTrack => {
    // setExtraVideoTrack(newTrack);
    //});

    return Video.createLocalVideoTrack(options).then(newTrack => {
      //setVideoTrack(extraVideoTrack);
      //return extraVideoTrack;
      setVideoTrack(newTrack);
      makeNewLocalVideoTrack();
      //getScreenVideoTrack();
      //setExtraVideoTrack(structuredClone(newTrack));
      return newTrack;
    });
  }, []);

  const makeNewLocalVideoTrack = useCallback(async () => {
    const selectedVideoDeviceId = window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY);

    const { videoInputDevices } = await getDeviceInfo();

    //const hasSelectedVideoDevice = true;
    const hasSelectedVideoDevice = videoInputDevices.some(
      device => selectedVideoDeviceId && device.deviceId === selectedVideoDeviceId
    );

    const options: CreateLocalTrackOptions = {
      ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
      name: `extra-${Date.now()}`,
      ...(hasSelectedVideoDevice && { deviceId: { exact: selectedVideoDeviceId! } }),
    };

    //Video.createLocalVideoTrack(optionsExtra).then(newTrack => {
    // setExtraVideoTrack(newTrack);
    //});

    return Video.createLocalVideoTrack(options).then(newTrack => {
      //setVideoTrack(extraVideoTrack);
      //return extraVideoTrack;
      //setVideoTrack(newTrack);
      console.log('lmake a new one');
      setExtraLocalVideoTrack(newTrack);
      return newTrack;
    });
  }, []);

  const getScreenVideoTrack = useCallback(async () => {
    console.log('in 1 func');
    const options: CreateLocalTrackOptions = {
      name: `screen-${Date.now()}`,
      ...{ displaySurface: 'tab' },
    };

    //Video.createLocalVideoTrack(optionsExtra).then(newTrack => {
    // setExtraVideoTrack(newTrack);
    //});

    return Video.createLocalVideoTrack(options).then(newTrack => {
      //setVideoTrack(extraVideoTrack);
      //return extraVideoTrack;
      //setVideoTrack(newTrack);
      console.log('make a screen one');
      setScreenTrack(newTrack);
      return newTrack;
    });
  }, []);

  const removeLocalAudioTrack = useCallback(() => {
    if (audioTrack) {
      audioTrack.stop();
      setAudioTrack(undefined);
    }
  }, [audioTrack]);

  const removeLocalVideoTrack = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(undefined);
      //setExtraLocalVideoTrack(undefined);
      removeExtraVideoTrack();
    }
  }, [videoTrack]);

  const removeExtraVideoTrack = useCallback(() => {
    if (extraLocalVideoTrack) {
      extraLocalVideoTrack.stop();
      setExtraLocalVideoTrack(undefined);
    }
  }, [extraLocalVideoTrack]);

  const removeScreenVideoTrack = useCallback(() => {
    if (screenTrack) {
      screenTrack.stop();
      setScreenTrack(undefined);
      //setExtraVideoTrack(undefined);
    }
  }, [screenTrack]);

  const getAudioAndVideoTracks = useCallback(async () => {
    const { audioInputDevices, videoInputDevices, hasAudioInputDevices, hasVideoInputDevices } = await getDeviceInfo();

    if (!hasAudioInputDevices && !hasVideoInputDevices) return Promise.resolve();
    if (isAcquiringLocalTracks || audioTrack || videoTrack) return Promise.resolve();

    setIsAcquiringLocalTracks(true);

    const selectedAudioDeviceId = window.localStorage.getItem(SELECTED_AUDIO_INPUT_KEY);
    const selectedVideoDeviceId = window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY);

    const hasSelectedAudioDevice = audioInputDevices.some(
      device => selectedAudioDeviceId && device.deviceId === selectedAudioDeviceId
    );
    //const hasSelectedVideoDevice = false;
    const hasSelectedVideoDevice = videoInputDevices.some(
      device => selectedVideoDeviceId && device.deviceId === selectedVideoDeviceId
    );

    // In Chrome, it is possible to deny permissions to only audio or only video.
    // If that has happened, then we don't want to attempt to acquire the device.
    const isCameraPermissionDenied = await isPermissionDenied('camera');
    const isMicrophonePermissionDenied = await isPermissionDenied('microphone');

    const shouldAcquireVideo = hasVideoInputDevices && !isCameraPermissionDenied;
    const shouldAcquireAudio = hasAudioInputDevices && !isMicrophonePermissionDenied;

    const localTrackConstraints = {
      video: shouldAcquireVideo && {
        ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
        name: `camera-${Date.now()}`,
        //...(hasSelectedVideoDevice && { deviceId: { exact: selectedVideoDeviceId! } }),
      },
      audio: shouldAcquireAudio && {
        noiseCancellationOptions,
        ...(hasSelectedAudioDevice && { deviceId: { exact: selectedAudioDeviceId! } }),
      },
    };

    return Video.createLocalTracks(localTrackConstraints)
      .then(tracks => {
        const newVideoTrack = tracks.find(
          track => track.name.includes('camera') && track.kind === 'video'
        ) as LocalVideoTrack;
        //const newScreenTrack = tracks.find(track => track.name.includes("screen") && track.kind === 'video') as LocalVideoTrack;
        //const newVideoTrack = extraVideoTrack as LocalVideoTrack;
        const newAudioTrack = tracks.find(track => track.kind === 'audio') as LocalAudioTrack;
        if (newVideoTrack) {
          setVideoTrack(newVideoTrack);
          makeNewLocalVideoTrack();
          // Save the deviceId so it can be picked up by the VideoInputList component. This only matters
          // in cases where the user's video is disabled.
          window.localStorage.setItem(
            SELECTED_VIDEO_INPUT_KEY,
            newVideoTrack.mediaStreamTrack.getSettings().deviceId ?? ''
          );
        }
        //if (newScreenTrack) {
        //  setScreenTrack(newScreenTrack);
        // Save the deviceId so it can be picked up by the VideoInputList component. This only matters
        // in cases where the user's video is disabled.
        // }
        if (newAudioTrack) {
          //newAudioTrack.disable();
          setAudioTrack(newAudioTrack);
          if (newAudioTrack.noiseCancellation) {
            setIsKrispEnabled(true);
            setIsKrispInstalled(true);
          }
        }

        // These custom errors will be picked up by the MediaErrorSnackbar component.
        if (isCameraPermissionDenied && isMicrophonePermissionDenied) {
          const error = new Error();
          error.name = 'NotAllowedError';
          throw error;
        }

        if (isCameraPermissionDenied) {
          throw new Error('CameraPermissionsDenied');
        }

        if (isMicrophonePermissionDenied) {
          throw new Error('MicrophonePermissionsDenied');
        }
      })
      .finally(() => setIsAcquiringLocalTracks(false));
  }, [audioTrack, videoTrack, screenTrack, isAcquiringLocalTracks, setIsKrispEnabled, setIsKrispInstalled]);

  const localTracks = [audioTrack, videoTrack, screenTrack].filter(track => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
  )[];

  return {
    extraLocalVideoTrack,
    //makeNewLocalVideoTrack,
    setScreenTrack,
    removeScreenVideoTrack,
    getScreenVideoTrack,
    localTracks,
    getLocalVideoTrack,
    isAcquiringLocalTracks,
    removeLocalAudioTrack,
    removeLocalVideoTrack,
    getAudioAndVideoTracks,
  };
}
