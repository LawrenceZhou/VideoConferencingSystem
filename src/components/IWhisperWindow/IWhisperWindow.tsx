import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import IWhisperHeader from './IWhisperHeader/IWhisperHeader';
import ChatInput from './ChatInput/ChatInput';
import clsx from 'clsx';
import ParticipantList from './ParticipantList/ParticipantList';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import { useAppState } from '../../state';
import WhisperMonitor from '../WhisperMonitor/WhisperMonitor';
import WhisperController from '../WhisperMonitor/WhisperController';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Paper } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    iWhisperWindowContainer: {
      background: '#FFFFFF',
      zIndex: 9,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #E4E7E9',
      paddingBottom: '25px',

      gap: '5px',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
    },
    hide: {
      display: 'none',
    },
  })
);

// In this component, we are toggling the visibility of the ChatWindow with CSS instead of
// conditionally rendering the component in the DOM. This is done so that the ChatWindow is
// not unmounted while a file upload is in progress.

export default function IWhisperWindow() {
  const classes = useStyles();
  const { isIWhisperWindowOpen, roleNameG } = useAppState();
  const { pipWindow } = useVideoContext();

  if (roleNameG !== 'Teacher') {
    return (
      <aside className={clsx(classes.iWhisperWindowContainer, { [classes.hide]: !isIWhisperWindowOpen })}>
        <IWhisperHeader />
        <div
          style={{
            padding: '5px',
            margin: '5px',
            minHeight: '90%',
          }}
        >
          <ParticipantList />
        </div>
      </aside>
    );
  }
  return (
    <aside className={clsx(classes.iWhisperWindowContainer, { [classes.hide]: !isIWhisperWindowOpen })}>
      <IWhisperHeader />
      <Paper
        elevation={3}
        style={{
          padding: '5px',
          margin: '5px',
          flex: 1,
          textAlign: 'start',
          width: '95%',
          height: '100%',
          minHeight: '30%',
          border: '1px solid #E4E7E9',
        }}
      >
        <ParticipantList />
      </Paper>

      {!pipWindow && (
        <Paper
          elevation={3}
          style={{
            background: 'black',
            padding: '5px',
            margin: '5px',
            flex: 1,
            textAlign: 'start',
            width: '95%',
            height: '30%',
            minHeight: '30%',
            border: '1px solid #E4E7E9',
          }}
        >
          <WhisperMonitor />
        </Paper>
      )}
      {!pipWindow && (
        <Paper
          elevation={3}
          style={{
            background: 'white',
            margin: '5px',
            padding: '5px',
            flex: 1,
            textAlign: 'start',
            width: '95%',
            height: '30%',
            minHeight: '30%',
            border: '1px solid #E4E7E9',
          }}
        >
          <WhisperController />
        </Paper>
      )}
    </aside>
  );
}
