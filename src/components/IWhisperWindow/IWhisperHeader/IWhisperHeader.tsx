import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import CloseIcon from '../../../icons/CloseIcon';

import { useAppState } from '../../../state';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '56px',
      background: '#F4F4F6',
      borderBottom: '1px solid #E4E7E9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 1em',
    },
    text: {
      fontWeight: 'bold',
    },
    closeIWhisperWindow: {
      cursor: 'pointer',
      display: 'flex',
      background: 'transparent',
      border: '0',
      padding: '0.4em',
    },
  })
);

export default function IWhisperWindowHeader() {
  const classes = useStyles();
  const { setIsIWhisperWindowOpen } = useAppState();

  return (
    <div className={classes.container}>
      <div className={classes.text}>I-Whisper 接耳</div>
      <button className={classes.closeIWhisperWindow} onClick={() => setIsIWhisperWindowOpen(false)}>
        <CloseIcon />
      </button>
    </div>
  );
}
