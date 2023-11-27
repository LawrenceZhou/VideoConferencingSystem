import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import { isMobile } from '../../utils';
import Menu from './Menu/Menu';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import { useAppState } from '../../state';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Typography, Grid, Hidden } from '@material-ui/core';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import RecordButton from '../Buttons/RecordButton/RecordButton';
import ToggleScreenShareButton from '../Buttons/ToggleScreenShareButton/ToggleScreenShareButton';
import Webcam from 'react-webcam';
import { Box, Clock, Footer, Text, Heading, Stack } from 'grommet';
import VideoTrack from '../VideoTrack/VideoTrack';
import AvatarIcon from '../../icons/AvatarIcon';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import usePublications from '../../hooks/usePublications/usePublications';
import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import NetworkQualityLevel from '../NetworkQualityLevel/NetworkQualityLevel';
import useTrack from '../../hooks/useTrack/useTrack';
import useIsRecording from '../../hooks/useIsRecording/useIsRecording';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${theme.footerHeight}px`,
      position: 'fixed',
      display: 'flex',
      padding: '0 1.43em',
      zIndex: 10,
      [theme.breakpoints.down('sm')]: {
        height: `${theme.mobileFooterHeight}px`,
        padding: 0,
      },
    },

    innerContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      width: '114px',
      height: '64px',
      overflow: 'hidden',
      background: 'black',
    },
    typography: {
      color: 'white',
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
      },
    },
    identity: {
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '0.18em 0.3em 0.18em 0',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
    },
    screenShareBanner: {
      position: 'fixed',
      zIndex: 8,
      bottom: `${theme.footerHeight}px`,
      left: 0,
      right: 0,
      height: '104px',
      background: 'rgba(0, 0, 0, 0.5)',
      '& h6': {
        color: 'white',
      },
      '& button': {
        background: 'white',
        color: theme.brand,
        border: `2px solid ${theme.brand}`,
        margin: '0 2em',
        '&:hover': {
          color: '#600101',
          border: `2px solid #600101`,
          background: '#FFE9E7',
        },
      },
    },
    hideMobile: {
      display: 'initial',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    avatarContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'black',
      width: '30px',
      height: '30px',

      [theme.breakpoints.down('sm')]: {
        '& svg': {
          transform: 'scale(0.7)',
        },
      },
    },
  })
);

export default function MenuBar() {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const { room } = useVideoContext();
  const participants = useParticipants();
  const localParticipant = room!.localParticipant;
  const { conditionNameG, roleNameG, experimentNameG } = useAppState();
  const { localTracks, extraLocalVideoTrack } = useVideoContext();
  const publications = usePublications(localParticipant);
  const isRecording = useIsRecording();

  const audioPublication = publications.find(p => p.kind === 'audio');
  const videoPublication = publications.find(p => p.kind === 'video');
  //const videoTrackP = useTrack(videoPublication) as RemoteVideoTrack | undefined;
  //const videoTrackP = extraLocalVideoTrack as LocalVideoTrack | undefined;
  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();

  //const [videoTrackP, setVideoTrackP] = useState<LocalVideoTrack|undefined>();
  //makeNewLocalVideoTrack().then((track: LocalVideoTrack) => setVideoTrackP(track));

  const videoTrack = localTracks.find(
    track => !track.name.includes('screen') && track.kind === 'video'
  ) as LocalVideoTrack;
  localTracks.forEach(track => console.log(track.name));
  //console.log(participants);
  //console.log(participants![0].identity);
  return (
    <>
      {false && (
        <Grid container justifyContent="center" alignItems="center" className={classes.screenShareBanner}>
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}
      <Footer background="light-1" pad={{ bottom: 'xxsmall' }} style={{ zIndex: 10 }}>
        <Hidden smDown>
          <Box align="center" direction="row">
            <Box align="center" direction="column" pad="xsmall">
              <Typography variant="h6">
                <strong>{experimentNameG}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Condition {conditionNameG} | {roleNameG}
              </Typography>
            </Box>

            {conditionNameG === '1' && roleNameG !== 'Researcher' && (
              <Box
                align="center"
                direction="column"
                height="64px"
                pad={{ bottom: '2px' }}
                width="114px"
                round="small"
                background="transparent"
              >
                <Stack anchor="top-left">
                  <Stack anchor="bottom-left">
                    <div className={classes.innerContainer}>
                      {isVideoEnabled && extraLocalVideoTrack ? (
                        <VideoTrack track={extraLocalVideoTrack} isLocal={true} />
                      ) : (
                        <div className={classes.avatarContainer}>
                          <AvatarIcon />
                        </div>
                      )}
                    </div>
                    <span className={classes.identity}>
                      <AudioLevelIndicator audioTrack={audioTrack} />
                    </span>
                  </Stack>
                  <NetworkQualityLevel participant={room!.localParticipant} />
                </Stack>
              </Box>
            )}

            {conditionNameG === '1' && roleNameG !== 'Researcher' && (
              <Box
                align="center"
                direction="column"
                height="64px"
                pad={{ bottom: '2px' }}
                width="114px"
                round="small"
                background="transparent"
              >
                <Stack anchor="top-left">
                  <Stack anchor="bottom-left">
                    <div className={classes.innerContainer}>
                      {isVideoEnabled ? (
                        <VideoTrack track={videoTrack} isLocal={true} />
                      ) : (
                        <div className={classes.avatarContainer}>
                          <AvatarIcon />
                        </div>
                      )}
                    </div>
                    <span className={classes.identity}>
                      <AudioLevelIndicator audioTrack={audioTrack} />
                    </span>
                  </Stack>
                  <NetworkQualityLevel participant={room!.localParticipant} />
                </Stack>
              </Box>
            )}
          </Box>
        </Hidden>

        {false && !isSharingScreen && !isMobile && <ToggleScreenShareButton disabled={isReconnecting} />}

        <Hidden smDown>
          <Box align="center" direction="row" gap="xsmall">
            {roleNameG !== 'Researcher' && <Menu />}
            <Box pad="xxsmall">
              {roleNameG !== 'Researcher' ? (
                <Clock type="digital" time="PT0H0M0S" run={isSharingScreen ? 'forward' : false} size="medium" />
              ) : (
                <Clock type="digital" time="PT0H0M0S" run={!isRecording ? false : 'forward'} size="medium" />
              )}

              {roleNameG !== 'Researcher' ? (
                !isSharingScreen ? (
                  <ToggleScreenShareButton disabled={isReconnecting} />
                ) : (
                  <EndCallButton />
                )
              ) : (
                <RecordButton />
              )}
            </Box>
          </Box>
        </Hidden>
      </Footer>
    </>
  );
}
