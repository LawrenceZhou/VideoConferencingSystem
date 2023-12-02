import React from 'react';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import LaunchIcon from '@material-ui/icons/Launch';
import { useAppState } from '../../../state';
const useStyles = makeStyles({
  iconContainer: {
    position: 'relative',
    display: 'flex',
    '& svg': {
      transform: 'scale(1.5)',
    },
  },
});

export default function OpenPiPButton(props: { disabled?: boolean; className?: string }) {
  //const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const classes = useStyles();
  const { requestPipWindow, pipWindow } = useVideoContext();
  const { roleNameG } = useAppState();
  //const hasAudioTrack = localTracks.some(track => track.kind === 'audio');
  const openPiP = function() {
    if (!pipWindow) {
      if (roleNameG === 'Teacher') {
        requestPipWindow(320, 320);
      } else {
        requestPipWindow(100, 100);
      }
    } else {
      //pipWindow.resizeBy(20, 30);
      const expandButton = pipWindow.document.createElement('button');
      expandButton.textContent = 'Expand PiP Window';
      expandButton.addEventListener('click', () => {
        // Expand the PiP window’s width by 20px and height by 30px.
        pipWindow.resizeBy(10, 10);
      });
      pipWindow.document.body.append(expandButton);
    }
  };
  return (
    <Tooltip title={'Open a Float Window'}>
      <Button
        className={props.className}
        onClick={openPiP}
        startIcon={
          <div className={classes.iconContainer}>
            <LaunchIcon />
          </div>
        }
        disabled={false}
      ></Button>
    </Tooltip>
  );
}
