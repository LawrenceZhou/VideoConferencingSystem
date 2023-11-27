import MainParticipantInfo from '../MainParticipantInfo/MainParticipantInfo';
import ParticipantTracks from '../ParticipantTracks/ParticipantTracks';
import React from 'react';
import useMainParticipant from '../../hooks/useMainParticipantIWhisper/useMainParticipant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

//interface MainParticipantProps {
//  trackToShow: string;
//};

//export default function MainParticipant({trackToShow}: MainParticipantProps) {
export default function MainParticipant() {
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const mainParticipant = useMainParticipant() || localParticipant;

  const screenShareParticipant = useScreenShareParticipant();

  /*const videoPriority =
    (mainParticipant === selectedParticipant || mainParticipant === screenShareParticipant) &&
    mainParticipant !== localParticipant
      ? 'high'
      : null;*/

  const videoPriority = 'high';

  const trackToShow = screenShareParticipant == undefined ? 'camera' : 'screen';
  return (
    /* audio is disabled for this participant component because this participant's audio 
       is already being rendered in the <ParticipantStrip /> component.  */
    <MainParticipantInfo participant={mainParticipant}>
      <ParticipantTracks
        participant={mainParticipant}
        videoOnly
        enableScreenShare={localParticipant.identity === 'Teacher'}
        videoPriority={videoPriority}
        isLocalParticipant={mainParticipant === localParticipant}
        trackToShow={trackToShow}
      />
    </MainParticipantInfo>
  );
}
