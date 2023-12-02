import React, { useState } from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import { RecordingRule, RecordingRules, RoomType } from '../../../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    buttonEnd: {
      background: theme.brand,
      color: 'white',
      '&:hover': {
        background: '#600101',
      },
    },

    buttonStart: {
      background: '#00C781',
      color: 'white',
      '&:hover': {
        background: '#00873D',
      },
    },
  })
);

export default function OperateLessonButton(props: { className?: string }) {
  const classes = useStyles();
  const { operateALesson } = useAppState();
  const { room } = useVideoContext();
  const [started, setStarted] = useState<boolean>(false);

  const pressStart = function() {
    operateALesson(room!.sid, !started);
    /*if (!started) {
      const rule1: RecordingRule = { type: 'include', all: true };
      const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
      const rule3: RecordingRule = { type: 'exclude', kind: 'audio' };
      const rule4: RecordingRule = { type: 'include', kind: 'audio', publisher: 'Teacher' };
      const rules: RecordingRules = [rule1, rule2, rule3, rule4];

      updateSubscribeRules(room!.sid, "Teacher", rules);
      setStarted(true);
    } else {
      const rule1: RecordingRule = { type: 'include', all: true };
      const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
      const rules: RecordingRules = [rule1, rule2];

      updateSubscribeRules(room!.sid, "Teacher", rules);
      setStarted(false);
    }*/
    setStarted(!started);
  };

  return (
    <Button
      onClick={pressStart}
      className={clsx(started ? classes.buttonEnd : classes.buttonStart, props.className)}
      data-cy-disconnect
    >
      {started ? 'End Lesson' : 'Start Lesson'}
    </Button>
  );
}
