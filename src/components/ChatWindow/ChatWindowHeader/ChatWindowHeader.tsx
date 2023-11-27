import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import CloseIcon from '../../../icons/CloseIcon';

import useChatContext from '../../../hooks/useChatContext/useChatContext';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '36px',
      background: '#F4F4F6',
      borderBottom: '1px solid #E4E7E9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 1em',
    },
    text: {
      fontWeight: 'normal',
    },
    closeChatWindow: {
      cursor: 'pointer',
      display: 'flex',
      height: '26px',
      width: '26px',
      background: 'transparent',
      border: '0',
      padding: '0 0.4em',
    },
  })
);

export default function ChatWindowHeader() {
  const classes = useStyles();
  const { setIsChatWindowOpen } = useChatContext();

  return (
    <div className={classes.container}>
      <div className={classes.text}>Meeting Chat</div>
      <button className={classes.closeChatWindow} onClick={() => setIsChatWindowOpen(false)}>
        <CloseIcon />
      </button>
    </div>
  );
}
