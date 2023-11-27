import React, { useEffect } from 'react';
import { useState } from 'react';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import clsx from 'clsx';
import { GALLERY_VIEW_ASPECT_RATIO, GALLERY_VIEW_MARGIN } from '../../constants';
import { IconButton, makeStyles, createStyles, Theme } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import Participant from '../Participant/Participant';
import useGalleryViewLayout from '../../hooks/useGalleryViewLayout/useGalleryViewLayout';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipantsContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import { usePagination } from './usePagination/usePagination';
import useDominantSpeaker from '../../hooks/useDominantSpeaker/useDominantSpeaker';
import { useAppState } from '../../state';
import Draggable from 'react-draggable';
import {
  RemoteParticipant,
  LocalParticipant,
  Participant as IParticipant,
  RemoteVideoTrack,
  RemoteTrack,
  LocalVideoTrack,
  RemoteTrackPublication,
} from 'twilio-video';
import { VideoRoomMonitor } from '@twilio/video-room-monitor';
import { Box, Grid } from 'grommet';
import usePublications from '../../hooks/usePublications/usePublications';

import VideoTrack from '../VideoTrack/VideoTrack';
import { IVideoTrack } from '../../types';

const CONTAINER_GUTTER = '50px';
const CONTAINER_GUTTER_L = '450px';

const URLs = ['https://forms.gle/yL6VBUdSvM9eUYaL7', 'https://forms.gle/1BPVYHXf7Q2kADoWA'];

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      //setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      background: theme.galleryViewBackgroundColor,
      position: 'relative',
      gridArea: '1 / 1 / 2 / 3',
    },
    participantContainer: {
      position: 'absolute',
      display: 'flex',
      top: 200,
      left: 0,
      width: '20vw',
      height: '20vh',
      margin: 0,
      alignContent: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      zIndex: 2400,
      opacity: 0.0,
    },

    iframeContainer: {
      width: '100%',
      height: '100%',
      backgroud: 'rgb(255, 255, 255)',
    },
    buttonContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonContainerLeft: {
      right: `calc(100% - ${CONTAINER_GUTTER})`,
      left: 0,
    },
    buttonContainerRight: {
      right: 0,
      left: `calc(100% - ${CONTAINER_GUTTER})`,
    },
    pagination: {
      '& .MuiPaginationItem-root': {
        color: 'white',
      },
    },
    paginationButton: {
      color: 'black',
      background: 'rgba(255, 255, 255, 0.8)',
      width: '40px',
      height: '40px',
      '&:hover': {
        background: 'rgba(255, 255, 255)',
      },
    },
    paginationContainer: {
      position: 'absolute',
      top: `calc(100% - ${CONTAINER_GUTTER})`,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
);

export function NonverbalView() {
  const classes = useStyles();
  const { maxGalleryViewParticipants, roleNameG, conditionNameG, roomType } = useAppState();
  const { room } = useVideoContext();
  const { galleryViewParticipants } = useParticipantsContext();
  const dominantSpeaker = useDominantSpeaker(true);
  const mousePosition = useMousePosition();

  const [floatWindowSize, setFloatWindowSize] = useState({ width: '15vw', height: 'auto' });
  const [count, setCount] = useState(0);

  console.log(roomType);
  /*const handleClick = (e: HTMLDivElement) => {
  switch (e.detail) {
    case 1:
      console.log("click");
      break;
    case 2:
      console.log("double click");
      if (count % 3 == 0) {
        setFloatWindowSize({ width: "30vw", height: "auto" });
      }else if(count % 3 == 1) {
        setFloatWindowSize({ width: "40vw", height: "auto" });
      }else{
        setFloatWindowSize({ width: "20vw", height: "auto" });
      }
      setCount(count + 1);
      break;
    case 3:
      console.log("triple click");
      break;
  }
};*/

  var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  var pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  //var cpLocal =  { identity: 'test-participant-1', sid: 1, videoTracks:room!.localParticipant.videoTracks };
  //let cpLocal = structuredClone(room!.localParticipant) as RemoteParticipant;
  //let cpLocal = room!.localParticipant;
  //let cpLocal = room!.localParticipant as RemoteParticipant;
  // = new IParticipant();
  //cpLocal.videoTracks=room!.localParticipant.videoTracks;
  //cpLocal.tracks=room!.localParticipant.tracks;

  const { paginatedParticipants } = usePagination([
    room!.localParticipant,
    ...galleryViewParticipants.filter(p => p.identity !== 'Researcher'),
  ]);

  const paginatedParticipantsNonverbal = galleryViewParticipants.filter(p => p.identity !== 'Researcher');
  //const paginatedParticipants = conditionNameG==="1" ? galleryViewParticipants : [room!.localParticipant,galleryViewParticipants];

  const galleryViewLayoutParticipantCount = paginatedParticipants.length;
  const { participantVideoWidth, containerRef } = useGalleryViewLayout(galleryViewLayoutParticipantCount);

  const participantWidth = `${participantVideoWidth}px`;
  const participantHeight = `${Math.floor(participantVideoWidth * GALLERY_VIEW_ASPECT_RATIO)}px`;
  if (roleNameG === 'Researcher') {
    VideoRoomMonitor.openMonitor();
  }

  {
    /*  //const onMouseMove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
  const onMouseMove = (e: MouseEvent) =>{
    if (e.pageY > pageHeight / 2 && e.pageX > pageWidth / 2){
      setFloatWindowPosition({ top: 0, left: 0 });
    }
    else if (e.pageY < pageHeight / 2 && e.pageX > pageWidth / 2){
      setFloatWindowPosition({ top: 500, left: 0 });
    }
     else if (e.pageY > pageHeight / 2 && e.pageX < pageWidth / 2){
      setFloatWindowPosition({ top: 0, left: 800 });
    }else {
      setFloatWindowPosition({ top: 500, left: 800 });
    }
  }
   window.addEventListener("mousemove", onMouseMove);*/
  }

  VideoRoomMonitor.registerVideoRoom(room!);

  const [teacherCameraVideoTrack, setTeacherCameraVideoTrack] = useState<RemoteTrack | null>();
  const [teacherScreenVideoTrack, setTeacherScreenVideoTrack] = useState<RemoteTrack | null>();
  const [studentCameraVideoTrack, setStudentCameraVideoTrack] = useState<RemoteTrack | null>();
  const [studentScreenVideoTrack, setStudentScreenVideoTrack] = useState<RemoteTrack | null>();

  if (roleNameG === 'Researcher') {
    return (
      <div className={classes.container}>
        <div
          ref={containerRef}
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

            {paginatedParticipantsNonverbal.map(participant => (
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
                      isDominantSpeaker={participant === dominantSpeaker}
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
                      isDominantSpeaker={participant === dominantSpeaker}
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
  } else {
    return (
      <div className={classes.container}>
        <Draggable>
          <div
            ref={containerRef}
            style={{
              padding: '0px',
              gap: '5px',
              position: 'absolute',
              display: 'flex',
              width: '15vw',
              height: 'auto',
              margin: '0 auto',
              alignContent: conditionNameG === '1' ? 'end' : 'start',
              flexWrap: 'wrap',
              justifyContent: conditionNameG === '1' ? 'end' : 'start',
              zIndex: 8,
              opacity: 1.0,
            }}
          >
            {(conditionNameG === '1' ? paginatedParticipantsNonverbal : paginatedParticipants).map(participant => (
              <div
                key={participant.sid}
                style={{ width: floatWindowSize.width, height: 'auto', margin: GALLERY_VIEW_MARGIN }}
              >
                <Participant
                  participant={participant}
                  isLocalParticipant={participant === room!.localParticipant}
                  isDominantSpeaker={participant === dominantSpeaker}
                  trackToShow="camera"
                />
              </div>
            ))}
          </div>
        </Draggable>

        <iframe className={classes.iframeContainer} src={roleNameG === 'Teacher' ? URLs[0] : URLs[1]}>
          Loading…
        </iframe>
      </div>
    );
  }
}
