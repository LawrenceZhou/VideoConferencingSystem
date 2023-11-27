import useVideoContext from '../useVideoContext/useVideoContext';
import { useState, useEffect } from 'react';
import { Participant } from 'twilio-video';

/*
  Returns the participant that is sharing their screen (if any). This hook assumes that only one participant
  can share their screen at a time.
*/
export default function useMainParticipant() {
  const { room } = useVideoContext();

  const localParticipant = room?.localParticipant;
  const [mainParticipant, setMainParticipant] = useState<Participant>();

  useEffect(() => {
    if (room) {
      const updateMainParticipant = () => {
        setMainParticipant(
          Array.from<Participant>(room.participants.values())
            // the screenshare participant could be the localParticipant
            .concat(room.localParticipant)
            .find((participant: Participant) => participant.identity === 'Teacher') || (localParticipant as Participant)
        );
      };
      updateMainParticipant();

      room.on('disconnected', updateMainParticipant);
      room.on('reconnected', updateMainParticipant);
      room.on('participantConnected', updateMainParticipant);
      room.on('participantDisconnected', updateMainParticipant);
      room.on('participantReconnected', updateMainParticipant);
      return () => {
        room.off('disconnected', updateMainParticipant);
        room.off('reconnected', updateMainParticipant);
        room.off('participantConnected', updateMainParticipant);
        room.off('participantDisconnected', updateMainParticipant);
        room.off('participantReconnected', updateMainParticipant);
      };
    }
  }, [room]);

  return mainParticipant;
}
