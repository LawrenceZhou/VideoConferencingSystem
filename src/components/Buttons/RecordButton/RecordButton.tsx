import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import useIsRecording from '../../../hooks/useIsRecording/useIsRecording';
import { useAppState } from '../../../state';

import { Button } from '@material-ui/core';

import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export default function RecordButton(props: { className?: string }) {
  const { room } = useVideoContext();
  const isRecording = useIsRecording();
  const {
    isFetching,
    updateRecordingRules,
    roomType,
    setIsGalleryViewActive,
    isGalleryViewActive,
    roleNameG,
  } = useAppState();
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      button: {
        background: isRecording ? theme.brand : '#00C781',
        color: 'white',
        '&:hover': {
          background: isRecording ? '#600101' : '#00873D',
        },
      },
    })
  );
  const classes = useStyles();

  return (
    <Button
      disabled={isFetching}
      className={clsx(classes.button, props.className)}
      onClick={() => {
        if (isRecording) {
          updateRecordingRules(room!.sid, [{ type: 'exclude', all: true }]);
        } else {
          updateRecordingRules(room!.sid, [{ type: 'include', all: true }]);
        }
      }}
      data-cy-recording-button
    >
      {!isRecording ? 'Start Recording' : 'Stop Recording'}
    </Button>
  );
}
