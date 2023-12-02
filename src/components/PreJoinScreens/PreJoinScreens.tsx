import React, { useState, useEffect, FormEvent } from 'react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroductionScreen from './IntroductionScreen/IntroductionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import MediaErrorSnackbar from './MediaErrorSnackbar/MediaErrorSnackbar';
import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
import { useAppState } from '../../state';
import { useParams } from 'react-router-dom';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

export enum Steps {
  roomNameStep,
  introductionStep,
  deviceSelectionStep,
}

export default function PreJoinScreens() {
  const { user, roleNameG } = useAppState();

  const { getAudioAndVideoTracks } = useVideoContext();
  const { URLRoomName } = useParams<{ URLRoomName?: string }>();
  const [step, setStep] = useState(Steps.roomNameStep);

  const [roleName, setRoleName] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [conditionName, setConditionName] = useState<string>('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [nameReal, setNameReal] = useState<string>('');

  const [mediaError, setMediaError] = useState<Error>();

  useEffect(() => {
    if (URLRoomName) {
      //setRoomName(URLRoomName);
      if (user?.displayName) {
        setStep(Steps.deviceSelectionStep);
      }
    }
  }, [user, URLRoomName]);

  useEffect(() => {
    if (step === Steps.deviceSelectionStep && !mediaError) {
      getAudioAndVideoTracks().catch(error => {
        console.log('Error acquiring local media:');
        console.dir(error);
        setMediaError(error);
      });
    }
  }, [getAudioAndVideoTracks, step, mediaError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // If this app is deployed as a twilio function, don't change the URL because routing isn't supported.
    // @ts-ignore
    //if (!window.location.origin.includes('twil.io') && !window.STORYBOOK_ENV) {
    //  window.history.replaceState(null, '', window.encodeURI(`/room/${roomName}${window.location.search || ''}`));
    //}
    if (roleNameG === 'Researcher') {
      setStep(Steps.deviceSelectionStep);
    } else {
      setStep(Steps.introductionStep);
    }
  };

  return (
    <IntroContainer>
      <MediaErrorSnackbar error={mediaError} />
      {step === Steps.roomNameStep && (
        <RoomNameScreen
          roleName={roleName}
          roles={roles}
          conditions={conditions}
          conditionName={conditionName}
          experimentName={roomName}
          setRoleName={setRoleName}
          setRoles={setRoles}
          setConditions={setConditions}
          setConditionName={setConditionName}
          setExperimentName={setRoomName}
          handleSubmit={handleSubmit}
          nameReal={nameReal}
          setNameReal={setNameReal}
        />
      )}

      {step === Steps.introductionStep && (
        <IntroductionScreen
          roleName={roleName}
          conditionName={conditionName}
          roomName={roomName}
          setStep={setStep}
          nameReal={nameReal}
        />
      )}

      {step === Steps.deviceSelectionStep && (
        <DeviceSelectionScreen
          roleName={roleName}
          conditionName={conditionName}
          roomName={roomName}
          setStep={setStep}
          nameReal={nameReal}
        />
      )}
    </IntroContainer>
  );
}
