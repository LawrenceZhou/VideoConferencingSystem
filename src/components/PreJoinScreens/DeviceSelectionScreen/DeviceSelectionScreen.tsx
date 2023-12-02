import React, { useState, useCallback, ChangeEvent } from 'react';
import {
  makeStyles,
  Typography,
  Grid,
  Button,
  Theme,
  Hidden,
  Switch,
  Tooltip,
  InputLabel,
  TextField,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import { Steps } from '../PreJoinScreens';
import ToggleAudioButton from '../../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../../Buttons/ToggleVideoButton/ToggleVideoButton';
import { useAppState } from '../../../state';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useKrispToggle } from '../../../hooks/useKrispToggle/useKrispToggle';
import SmallCheckIcon from '../../../icons/SmallCheckIcon';
import InfoIconOutlined from '../../../icons/InfoIconOutlined';
import ToggleScreenShareButton from '../../Buttons/ToggleScreenShareButton/ToggleScreenShareButton';
import useRoomState from '../../../hooks/useRoomState/useRoomState';
import DeviceSelectionDiv from '../../DeviceSelectionDialog/DeviceSelectionDiv';
import { getDeviceInfo, isPermissionDenied } from '../../../utils';
import { RecordingRule, RecordingRules, RoomType } from '../../../types';

import { SyncClient } from 'twilio-sync';

const useStyles = makeStyles((theme: Theme) => ({
  inputContainer: {
    display: 'flex',
    width: '40%',
    justifyContent: 'stretch',
    margin: '0.5em 0 0.5em',
    '& div:not(:last-child)': {
      marginRight: '2em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '0.5em 0 0.5em',
    },
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
  gutterBottom: {
    marginBottom: '1em',
  },
  marginTop: {
    marginTop: '1em',
  },
  deviceButton: {
    width: '100%',
    border: '2px solid #aaa',
    margin: '0.5em 0',
  },
  localPreviewContainer: {
    height: '208px',
    width: '352px',
    paddingLeft: '0em',
    marginBottom: '0em',
    [theme.breakpoints.down('sm')]: {
      padding: '0 2.5em',
    },
  },
  joinButtons: {
    display: 'flex',
    alignContent: 'end',
    justifyContent: 'end',
    gap: '40px',
    margin: '0.5em',
    paddingRight: '4em',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      width: '100%',
      '& button': {
        margin: '1em 0',
        gap: '3px',
      },
    },
  },
  mobileButtonBar: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '1.5em 0 1em',
    },
  },
  mobileButton: {
    padding: '0.8em 0',
    margin: 0,
  },
  textFieldContainer: {
    width: '100%',
  },
  toolTipContainer: {
    display: 'flex',
    alignItems: 'center',
    '& div': {
      display: 'flex',
      alignItems: 'center',
    },
    '& svg': {
      marginLeft: '0.3em',
    },
  },
}));

interface DeviceSelectionScreenProps {
  roleName: string;
  roomName: string;
  conditionName: string;
  setStep: (step: Steps) => void;
  nameReal: string;
}

export default function DeviceSelectionScreen({
  roleName,
  conditionName,
  roomName,
  setStep,
  nameReal,
}: DeviceSelectionScreenProps) {
  const classes = useStyles();
  const {
    getToken,
    getTokenSync,
    isFetching,
    isKrispEnabled,
    isKrispInstalled,
    roleNameG,
    conditionNameG,
    ifALessonStarted,
    syncClient,
    setSyncClient,
    registerName,
    getNameTable,
    setNameTable,
  } = useAppState();
  const { connect: chatConnect } = useChatContext();
  const { connect: videoConnect, isAcquiringLocalTracks, isConnecting, room } = useVideoContext();
  const { toggleKrisp } = useKrispToggle();
  const disableButtons = isFetching || isAcquiringLocalTracks || isConnecting;
  const [password, setPassword] = useState<string>('');
  const [wrong, setWrong] = useState<boolean>(false);
  const { isSharingScreen, toggleScreenShare } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const [permission, setPermission] = useState<boolean>(false);

  const checkPermission = useCallback(async () => {
    const isCameraPermissionDenied = await isPermissionDenied('camera');
    const isMicrophonePermissionDenied = await isPermissionDenied('microphone');
    return !isCameraPermissionDenied && !isMicrophonePermissionDenied;
  }, [isPermissionDenied]);

  checkPermission().then(p => setPermission(p));

  const handleJoin = () => {
    //  if (!window.location.origin.includes('twil.io') && !window.STORYBOOK_ENV) {
    if (roleNameG === 'Researcher') {
      if (password !== 'researcher') {
        setWrong(true);
        return;
      }
    }
    const urlRoomName = roomName.replace(/\s+/g, '') + '-' + conditionName;
    if (!window.location.origin.includes('twil.io')) {
      window.history.replaceState(null, '', window.encodeURI(`/room/${urlRoomName}${window.location.search || ''}`));
    }
    registerName(nameReal, roleName).then(() => {
      getToken(roleName, urlRoomName).then(({ token }) => {
        getNameTable(roleName).then(({}) => {
          //setNameTable(new_table);
        });
        videoConnect(token);
        process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true' && chatConnect(token);
        if (roomName === 'I-Whisper Experiment' && conditionName === '1') {
          getTokenSync().then(({ tokenSync }) => {
            console.log(tokenSync);
            const syncClient_ = new SyncClient(tokenSync);
            setSyncClient(syncClient_);
          });
        }
      });
    });
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  if (isFetching || isConnecting) {
    return (
      <Grid container justifyContent="center" alignItems="center" direction="column" style={{ height: '100%' }}>
        <div>
          <CircularProgress variant="indeterminate" />
        </div>
        <div>
          <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '16px' }}>
            Joining {roomName}, condition {conditionName}
          </Typography>
        </div>
      </Grid>
    );
  }

  if (roleNameG === 'Researcher') {
    return (
      <Grid container justifyContent="center" alignItems="center" direction="column" style={{ height: '100%' }}>
        <div className={classes.inputContainer}>
          <div className={classes.textFieldContainer}>
            <InputLabel shrink htmlFor="input-password">
              Password
            </InputLabel>
            <TextField
              id="input-password"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
        </div>

        <Typography variant="body1" style={{ display: wrong ? 'block' : 'none' }} color={'error'}>
          Wrong password.
        </Typography>

        <div className={classes.joinButtons}>
          <Button variant="outlined" color="primary" onClick={() => setStep(Steps.roomNameStep)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" data-cy-join-now onClick={handleJoin} disabled={disableButtons}>
            Join Now
          </Button>
        </div>
      </Grid>
    );
  }

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        {nameReal}, join {roomName}, condition {conditionName}, as {roleName}.
      </Typography>

      <Grid container>
        <Grid item md={5} sm={12} xs={12}>
          {!permission ? (
            <Typography variant="body1">Please allow this site to access your video and audio devices.</Typography>
          ) : (
            <DeviceSelectionDiv />
          )}
        </Grid>

        <Grid item md={5} sm={12} xs={12} style={{ paddingLeft: '2em' }}>
          <div className={classes.localPreviewContainer}>
            <LocalVideoPreview identity={nameReal} />
          </div>
        </Grid>

        {/*}
        <Grid item md={5} sm={12} xs={12}>
          <Grid container direction="column" justifyContent="center" style={{ alignItems: 'normal' }}>
            <div>
           
                <ToggleAudioButton className={classes.deviceButton} disabled={disableButtons} />
                <ToggleVideoButton className={classes.deviceButton} disabled={disableButtons} />
                <ToggleScreenShareButton  className={classes.deviceButton} disabled={isReconnecting} />
           
            </div>
          </Grid>
        </Grid>*/}
      </Grid>
      <div className={classes.joinButtons}>
        <Button variant="outlined" color="primary" onClick={() => setStep(Steps.roomNameStep)}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" data-cy-join-now onClick={handleJoin} disabled={disableButtons}>
          Join Now
        </Button>
      </div>
    </>
  );
}
