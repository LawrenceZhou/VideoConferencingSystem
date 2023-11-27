import React from 'react';

import Button from '@material-ui/core/Button';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export default function OpenPiPButton(props: { disabled?: boolean; className?: string }) {
  //const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { requestPipWindow } = useVideoContext();

  //const hasAudioTrack = localTracks.some(track => track.kind === 'audio');
  const openPiP = function() {
    requestPipWindow(240, 135);
  };
  return (
    <Button className={props.className} onClick={openPiP} disabled={false}>
      Open a Float Window
    </Button>
  );
}
