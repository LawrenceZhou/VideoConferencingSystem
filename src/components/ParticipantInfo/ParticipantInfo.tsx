import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import AvatarIcon from '../../icons/AvatarIcon';
import NetworkQualityLevel from '../NetworkQualityLevel/NetworkQualityLevel';
import PinIcon from './PinIcon/PinIcon';
import ScreenShareIcon from '../../icons/ScreenShareIcon';
import Typography from '@material-ui/core/Typography';

import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import usePublications from '../../hooks/usePublications/usePublications';
import useTrack from '../../hooks/useTrack/useTrack';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import { useAppState } from '../../state';

const borderWidth = 2;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      isolation: 'isolate',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: 0,
      overflow: 'hidden',
      marginBottom: '0.0em',
      '& video': {
        objectFit: 'contain !important',
      },
      borderRadius: '4px',
      border: `${theme.participantBorderWidth}px solid rgb(245, 248, 255)`,
      paddingTop: `calc(${(9 / 16) * 100}% - ${theme.participantBorderWidth}px)`,
      background: 'transparent',
      [theme.breakpoints.down('sm')]: {
        height: theme.sidebarMobileHeight,
        width: `${(theme.sidebarMobileHeight * 16) / 9}px`,
        marginRight: '8px',
        marginBottom: '0',
        fontSize: '12px',
        paddingTop: `${theme.sidebarMobileHeight - 2}px`,
      },
    },
    innerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    infoContainer: {
      position: 'absolute',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      width: '100%',
      background: 'transparent',
      top: 0,
    },
    avatarContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'black',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1,
      [theme.breakpoints.down('sm')]: {
        '& svg': {
          transform: 'scale(0.7)',
        },
      },
    },
    reconnectingContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(40, 42, 43, 0.75)',
      zIndex: 1,
    },
    screenShareIconContainer: {
      background: 'rgba(0, 0, 0, 0.5)',
      padding: '0.05em 0.05em',
      marginRight: '0.0em',
      display: 'flex',
      '& path': {
        fill: 'white',
      },
      '& svg': {
        transform: 'scale(0.8)',
      },
    },
    identity: {
      background: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '0.0em 0.2em 0.0em 0.0em',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.8rem',
      '& svg': {
        transform: 'scale(0.8)',
      },
    },
    infoRowBottom: {
      display: 'flex',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 0,
      left: 0,
      fontSize: '0.8rem',
      '& svg': {
        transform: 'scale(0.8)',
      },
    },
    typography: {
      color: 'white',
      fontSize: '0.7rem',
      '& svg': {
        transform: 'scale(0.7)',
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: '1rem',
      },
    },
    hideParticipant: {
      display: 'none',
    },
    cursorPointer: {
      cursor: 'pointer',
    },
    galleryView: {
      border: `${theme.participantBorderWidth}px solid ${theme.galleryViewBackgroundColor}`,
      borderRadius: '8px',
      [theme.breakpoints.down('sm')]: {
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: '0',
        fontSize: '12px',
        margin: '0',
        '& video': {
          objectFit: 'cover !important',
        },
      },
    },
    dominantSpeaker: {
      border: `solid ${borderWidth}px #7BEAA5`,
    },
  })
);

interface ParticipantInfoProps {
  participant: Participant;
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  isLocalParticipant?: boolean;
  hideParticipant?: boolean;
  isDominantSpeaker?: boolean;
}

export default function ParticipantInfo({
  participant,
  onClick,
  isSelected,
  children,
  isLocalParticipant,
  hideParticipant,
  isDominantSpeaker,
}: ParticipantInfoProps) {
  const publications = usePublications(participant);

  const audioPublication = publications.find(p => p.kind === 'audio');
  const videoPublication = publications.find(p => !p.trackName.includes('screen') && p.kind === 'video');

  const isVideoEnabled = Boolean(videoPublication);
  const isScreenShareEnabled = publications.find(p => p.trackName.includes('screen'));

  const videoTrack = useTrack(videoPublication);
  const isVideoSwitchedOff = useIsTrackSwitchedOff(videoTrack as LocalVideoTrack | RemoteVideoTrack);

  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;
  const isParticipantReconnecting = useParticipantIsReconnecting(participant);

  const { isGalleryViewActive, experimentNameG, conditionNameG, roleNameG, nameTable } = useAppState();

  const classes = useStyles();

  if (roleNameG === 'Researcher') {
    return (
      <div
        className={clsx(classes.container, {
          [classes.hideParticipant]: hideParticipant,
          [classes.cursorPointer]: Boolean(onClick),
          [classes.dominantSpeaker]: isDominantSpeaker,
          [classes.galleryView]: isGalleryViewActive,
        })}
        onClick={onClick}
        data-cy-participant={participant.identity}
        style={{ border: '4px solid black' }}
      >
        <div className={classes.infoContainer}>
          <div>{isSelected && <PinIcon />}</div>
        </div>
        <div className={classes.innerContainer}>
          {(!isVideoEnabled || isVideoSwitchedOff) && <div className={classes.avatarContainer}>{<AvatarIcon />}</div>}
          {isParticipantReconnecting && (
            <div className={classes.reconnectingContainer}>
              <Typography variant="body1" className={classes.typography}>
                Reconnecting...
              </Typography>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(classes.container, {
        [classes.hideParticipant]: hideParticipant,
        [classes.cursorPointer]: Boolean(onClick),
        [classes.dominantSpeaker]: isDominantSpeaker,
        [classes.galleryView]: isGalleryViewActive,
      })}
      onClick={onClick}
      data-cy-participant={participant.identity}
      style={{
        border: experimentNameG === 'Nonverbal Cues Experiment' && conditionNameG === '1' ? '0px' : '4px solid black',
      }}
    >
      <div className={classes.infoContainer}>
        {true || (experimentNameG === 'Nonverbal Cues Experiment' && conditionNameG === '1') ? null : (
          <NetworkQualityLevel participant={participant} />
        )}
        <div className={classes.infoRowBottom}>
          {!(experimentNameG === 'Nonverbal Cues Experiment' && conditionNameG === '1') && isScreenShareEnabled && (
            <span className={classes.screenShareIconContainer}>
              <ScreenShareIcon />
            </span>
          )}

          {!(experimentNameG === 'Nonverbal Cues Experiment' && conditionNameG === '1') && (
            <span className={classes.identity}>
              {!isScreenShareEnabled && <AudioLevelIndicator audioTrack={audioTrack} />}
              <Typography variant="body1" className={classes.typography} component="span">
                {Array.isArray(nameTable) && nameTable!.find(n => n.role === participant.identity)!.name}
                {isLocalParticipant && ' (You)'}
              </Typography>
            </span>
          )}
        </div>
        <div>{isSelected && <PinIcon />}</div>
      </div>
      <div className={classes.innerContainer}>
        {(!isVideoEnabled || isVideoSwitchedOff) && <div className={classes.avatarContainer}>{<AvatarIcon />}</div>}
        {isParticipantReconnecting && (
          <div className={classes.reconnectingContainer}>
            <Typography variant="body1" className={classes.typography}>
              Reconnecting...
            </Typography>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
