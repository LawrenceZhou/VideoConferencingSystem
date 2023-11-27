import React, { useRef, useEffect, useCallback } from 'react';
import { IVideoTrack } from '../../types';
import { styled } from '@material-ui/core/styles';
import { Track, LocalVideoTrack } from 'twilio-video';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoTrackDimensions from '../../hooks/useVideoTrackDimensions/useVideoTrackDimensions';
//import {eVirtualBackgroundProcessor} from '../../customized/processors/background/eVirtualBackgroundProcessor';
import { rmGreenProcessor } from '../../customized/processors/background/rmGreenProcessor';
//import {FaceLandmarkProcessor} from '../../customized/processors/faceLandmark/FaceLandmarkProcessor';
import {
  ImageFit,
  isSupported,
  GaussianBlurBackgroundProcessor,
  //} from './virtualbackground/twilio-video-processors.js';
} from '@twilio/video-processors';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import { HolisticProcessor } from '../../customized/processors/holistic/HolisticProcessor';

const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'fill',
});

const eVideo = styled('video')({
  width: '100%',
  height: '100%',
  transform: 'scaleX(-1)',
  objectFit: 'fill',
});

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  isPreview?: boolean;
  priority?: Track.Priority | null;
}

export default function VideoTrack({ track, isLocal, isPreview, priority }: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null!);
  const mediaStreamTrack = useMediaStreamTrack(track);
  const dimensions = useVideoTrackDimensions(track);
  const isPortrait = (dimensions?.height ?? 0) > (dimensions?.width ?? 0);
  //const [backgroundSettings, setBackgroundSettings] = useBackgroundSettings(track);
  const _rmGreenProcessor = new (rmGreenProcessor as any)();
  const _holisticProcessor = new (HolisticProcessor as any)();
  //const faceLandmarkProcessor = new (FaceLandmarkProcessor as any)();
  const { room, localTracks, getLocalVideoTrack, removeLocalVideoTrack, onError } = useVideoContext();
  const { experimentNameG, conditionNameG, roleNameG } = useAppState();

  const removeProcessor = useCallback(() => {
    if (track && track.processor) {
      track.removeProcessor(track.processor);
    }
  }, [track]);

  const addProcessor = useCallback(
    (processor: InstanceType<typeof rmGreenProcessor> | InstanceType<typeof HolisticProcessor>) => {
      if (!track) {
        return;
      }
      removeProcessor();

      track.addProcessor(processor, {
        inputFrameBufferType: isLocal ? 'video' : 'video',
        outputFrameBufferContextType: '2d',
      });
    },
    [track, removeProcessor]
  );

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);

    if (isPreview) {
    } else {
      if (experimentNameG === 'Nonverbal Cues Experiment' && conditionNameG === '1' && !isLocal) {
        //track.addProcessor(_rmGreenProcessor,
        // {inputFrameBufferType: 'video',outputFrameBufferContextType: '2d',}
        // );
        //console.log("here???");
        addProcessor(_rmGreenProcessor);
        //addProcessor(faceLandmarkProcessor);
      } else {
        //addProcessor(_holisticProcessor);
        //getLocalVideoTrack()
        //    .then((newTrack: LocalVideoTrack) => {track=newTrack;}
        //   );
        //addProcessor(_rmGreenProcessor_);
        //removeProcessor();
        //track.removeProcessor(track.processor!);
        //addProcessor(_rmGreenProcessor);
        /*
     if (track && track.processor) {
      track.removeProcessor(track.processor);
    }
     track.addProcessor(_rmGreenProcessor, 
       {inputFrameBufferType: 'canvas',outputFrameBufferContextType: '2d',}
       );*/
      }
    }

    //if (true){ track.addProcessor(_rmGreenProcessor, {inputFrameBufferType: 'video',outputFrameBufferContextType: '2d',});};

    return () => {
      track.detach(el);

      // This addresses a Chrome issue where the number of WebMediaPlayers is limited.
      // See: https://github.com/twilio/twilio-video.js/issues/1528
      el.srcObject = null;

      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority, addProcessor, removeProcessor, _rmGreenProcessor, _holisticProcessor]);

  // The local video track is mirrored if it is not facing the environment.
  const isFrontFacing = mediaStreamTrack?.getSettings().facingMode !== 'environment';
  const style = {
    transform: isLocal && isFrontFacing ? 'scaleX(-1)' : '',
    objectFit: isPortrait || track.name.includes('screen') ? ('contain' as const) : ('cover' as const),
  };

  const styleE = {
    width: '100%',
    height: '100%',
    transform: 'scaleX(-1)',
    objectFit: 'fill' as const,
  };

  if (
    experimentNameG === 'Nonverbal Cues Experiment' &&
    conditionNameG === '1' &&
    roleNameG !== 'Researcher' &&
    isLocal
  ) {
    return (
      <>
        <video id="webcam" style={styleE} ref={ref} className="input_video"></video>
      </>
    );
  }

  return <Video ref={ref} style={style} />;
}
