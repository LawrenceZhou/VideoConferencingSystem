import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    messageInfoContainer: {
      display: 'flex',
      //justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.425em 0 0.083em',
      fontSize: '12px',
      //color: '#606B85',
      color: '#000000',
    },

    otherContainer: {
      color: '#3C6DCB',
      cursor: 'pointer',
    },
  })
);

interface MessageInfoProps {
  author: string;
  authorID: string;
  dateCreated: string;
  isLocalParticipant: boolean;
  to: string;
  toID: string;
  setTo: (to: string) => void;
}

export default function MessageInfo({
  author,
  authorID,
  dateCreated,
  isLocalParticipant,
  to,
  toID,
  setTo,
}: MessageInfoProps) {
  const classes = useStyles();

  const changeSendTo = (newTo: string) => {
    setTo(newTo);
  };

  return (
    <div className={classes.messageInfoContainer}>
      {isLocalParticipant ? (
        <div>You</div>
      ) : (
        <div className={classes.otherContainer} onClick={() => changeSendTo(authorID)}>
          {author}
        </div>
      )}
      <div>&nbsp;to&nbsp;</div>
      {to === 'You' ? (
        <div>You</div>
      ) : (
        <div className={classes.otherContainer} onClick={() => changeSendTo(toID)}>
          {to}
        </div>
      )}
      {to === 'You' ? <div style={{ color: '#FF0000' }}>&nbsp;(Private Message)&nbsp;</div> : <div>&nbsp;</div>}
      <div style={{ color: '#606B85' }}>{`${dateCreated}`}</div>
    </div>
  );
}
