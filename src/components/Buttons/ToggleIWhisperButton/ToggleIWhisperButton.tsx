import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { AssistListening } from 'grommet-icons';
import { useAppState } from '../../../state';
import { RecordingRule, RecordingRules, RoomType } from '../../../types';

export const ANIMATION_DURATION = 700;

const useStyles = makeStyles({
  iconContainer: {
    position: 'relative',
    display: 'flex',
    '& svg': {
      transform: 'scale(1.5)',
    },
  },
  circle: {
    width: '10px',
    height: '10px',
    backgroundColor: '#5BB75B',
    borderRadius: '50%',
    position: 'absolute',
    top: '-3px',
    left: '13px',
    opacity: 0,
    transition: `opacity ${ANIMATION_DURATION * 0.5}ms ease-in`,
  },
  hasUnreadMessages: {
    opacity: 1,
  },
  ring: {
    border: '3px solid #5BB75B',
    borderRadius: '30px',
    height: '14px',
    width: '14px',
    position: 'absolute',
    left: '11px',
    top: '-5px',
    opacity: 0,
  },
  animateRing: {
    animation: `$expand ${ANIMATION_DURATION}ms ease-out`,
    animationIterationCount: 1,
  },
  '@keyframes expand': {
    '0%': {
      transform: 'scale(0.1, 0.1)',
      opacity: 0,
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1.4, 1.4)',
      opacity: 0,
    },
  },
});

export default function ToggleIWhisperButton() {
  const classes = useStyles();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [started, setStarted] = useState(false);
  const {
    isIWhisperWindowOpen,
    setIsIWhisperWindowOpen,
    updateSubscribeRules,
    roleNameG,
    operateALesson,
  } = useAppState();
  const { setIsBackgroundSelectionOpen, room } = useVideoContext();

  const toggleIWhisperWindow = () => {
    if (roleNameG === 'Teacher') {
      pressStart();
    }
    //updateRecordingRules(room!.sid, []);
    setIsIWhisperWindowOpen(!isIWhisperWindowOpen);
    setIsBackgroundSelectionOpen(false);
  };

  useEffect(() => {
    if (shouldAnimate) {
      setTimeout(() => setShouldAnimate(false), ANIMATION_DURATION);
    }
  }, [shouldAnimate]);

  const pressStart = function() {
    operateALesson(room!.sid, !started);
    if (!started) {
      const rule1: RecordingRule = { type: 'include', all: true };
      const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
      const rule3: RecordingRule = { type: 'exclude', kind: 'audio' };
      const rule4: RecordingRule = { type: 'include', kind: 'audio', publisher: 'Teacher' };
      const rules: RecordingRules = [rule1, rule2, rule3, rule4];

      updateSubscribeRules(room!.sid, roleNameG, rules);
      setStarted(true);
    } else {
      const rule1: RecordingRule = { type: 'include', all: true };
      const rule2: RecordingRule = { type: 'exclude', publisher: 'Researcher' };
      const rules: RecordingRules = [rule1, rule2];

      updateSubscribeRules(room!.sid, roleNameG, rules);
      setStarted(false);
    }
  };

  return (
    <Button
      data-cy-chat-button
      onClick={toggleIWhisperWindow}
      disabled={false}
      startIcon={
        <div className={classes.iconContainer}>
          <AssistListening />
          <div className={clsx(classes.ring, { [classes.animateRing]: shouldAnimate })} />
          <div className={clsx(classes.circle, { [classes.hasUnreadMessages]: true })} />
        </div>
      }
    ></Button>
  );
}
