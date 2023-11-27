import React, { createContext, useContext, useReducer, useState, useMemo, useCallback, useEffect } from 'react';
import { RecordingRules, RoomType } from '../types';
import { TwilioError } from 'twilio-video';
import { settingsReducer, initialSettings, Settings, SettingsAction } from './settings/settingsReducer';
import useActiveSinkId from './useActiveSinkId/useActiveSinkId';
import useFirebaseAuth from './useFirebaseAuth/useFirebaseAuth';
import { useLocalStorageState } from '../hooks/useLocalStorageState/useLocalStorageState';
import usePasscodeAuth from './usePasscodeAuth/usePasscodeAuth';
import { User } from 'firebase/auth';
import { SyncClient } from 'twilio-sync';
//import {FaceLandmarkProcessor} from '../customized/processors/faceLandmark/FaceLandmarkProcessor';

export interface IWhisperEventType {
  id: string;
  category: string;
  timestamp: number;
  from: string;
  to: string;
}

export interface SetPropertyType {
  id: string;
  property: string;
  timestamp: number;
}

export interface StateContextType {
  error: TwilioError | Error | null;
  setError(error: TwilioError | Error | null): void;
  getToken(name: string, room: string, passcode?: string): Promise<{ room_type: RoomType; token: string }>;
  user?: User | null | { displayName: undefined; photoURL: undefined; passcode?: string };
  signIn?(passcode?: string): Promise<void>;
  signOut?(): Promise<void>;
  isAuthReady?: boolean;
  isFetching: boolean;
  activeSinkId: string;
  setActiveSinkId(sinkId: string): void;
  settings: Settings;
  dispatchSetting: React.Dispatch<SettingsAction>;
  roomType?: RoomType;
  updateRecordingRules(room_sid: string, rules: RecordingRules): Promise<object>;
  updateSubscribeRules(room_sid: string, who: string, rules: RecordingRules): Promise<object>;
  operateALesson(room_sid: string, toStart: boolean): Promise<object>;
  ifALessonStarted(room_sid: string): Promise<object>;
  isGalleryViewActive: boolean;
  setIsGalleryViewActive: React.Dispatch<React.SetStateAction<boolean>>;
  maxGalleryViewParticipants: number;
  setMaxGalleryViewParticipants: React.Dispatch<React.SetStateAction<number>>;
  isKrispEnabled: boolean;
  setIsKrispEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isKrispInstalled: boolean;
  setIsKrispInstalled: React.Dispatch<React.SetStateAction<boolean>>;
  experimentNameG: string;
  setExperimentNameG(experimentNameG: string): void;
  conditionNameG: string;
  setConditionNameG(conditionNameG: string): void;
  roleNameG: string;
  setRoleNameG(roleNameG: string): void;
  isPreStage: boolean;
  setIsPreStage(isPreStage: boolean): void;
  isPiPWindowOpen: boolean;
  setIsPiPWindowOpen(isPiPWindowOpen: boolean): void;
  isIWhisperWindowOpen: boolean;
  setIsIWhisperWindowOpen(isIWhisperWindowOpen: boolean): void;
  //isIWhispered: boolean;
  //setIsIWhispered(isIWhispered: boolean): void;
  isIWhisperedBy: string;
  setIsIWhisperedBy(isIWhisperedBy: string): void;
  eventHistory: IWhisperEventType[];
  setEventHistory(eventHistory: IWhisperEventType[]): void;
  propertyHistory: SetPropertyType[];
  setPropertyHistory(propertyHistory: SetPropertyType[]): void;

  //  faceLandmarkProcessor: FaceLandmarkProcessor;
}

export const StateContext = createContext<StateContextType>(null!);

/*
  The 'react-hooks/rules-of-hooks' linting rules prevent React Hooks from being called
  inside of if() statements. This is because hooks must always be called in the same order
  every time a component is rendered. The 'react-hooks/rules-of-hooks' rule is disabled below
  because the "if (process.env.REACT_APP_SET_AUTH === 'firebase')" statements are evaluated
  at build time (not runtime). If the statement evaluates to false, then the code is not
  included in the bundle that is produced (due to tree-shaking). Thus, in this instance, it
  is ok to call hooks inside if() statements.
*/
export default function AppStateProvider(props: React.PropsWithChildren<{}>) {
  const [error, setError] = useState<TwilioError | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isGalleryViewActive, setIsGalleryViewActive] = useLocalStorageState('gallery-view-active-key', true);
  const [activeSinkId, setActiveSinkId] = useActiveSinkId();
  const [settings, dispatchSetting] = useReducer(settingsReducer, initialSettings);
  const [roomType, setRoomType] = useState<RoomType>();
  const [experimentNameG, setExperimentNameG] = useState('');
  const [conditionNameG, setConditionNameG] = useState('');
  const [roleNameG, setRoleNameG] = useState('');
  const [isPreStage, setIsPreStage] = useState<boolean>(true);
  const [maxGalleryViewParticipants, setMaxGalleryViewParticipants] = useLocalStorageState(
    'max-gallery-participants-key',
    6
  );

  const [isKrispEnabled, setIsKrispEnabled] = useState(false);
  const [isKrispInstalled, setIsKrispInstalled] = useState(false);
  // let faceLandmarkProcessor = new FaceLandmarkProcessor();
  const [isPiPWindowOpen, setIsPiPWindowOpen] = useState<boolean>(false);
  const [isIWhisperWindowOpen, setIsIWhisperWindowOpen] = useState<boolean>(false);
  const [isIWhispered, setIsIWhispered] = useState<boolean>(false);
  const [isIWhisperedBy, setIsIWhisperedBy] = useState<string>('');
  const [eventHistory, setEventHistory] = useState<IWhisperEventType[]>([]);
  const [propertyHistory, setPropertyHistory] = useState<SetPropertyType[]>([]);

  useEffect(() => {
    fetch('https://192.168.3.5:5000/token', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        const syncClient = new SyncClient(data.token);
        syncClient.list('actionList').then(list => {
          list.on('itemAdded', e => {
            //setActions((actions) => actions.concat(e.item.data.value.action));
            //console.log(e.item.data)
            let timestamp = Date.now();
            let lastEvent = null;
            if (e.item.data.action !== 'setProperty') {
              if (eventHistory && eventHistory.length > 0 && eventHistory[eventHistory.length - 1]) {
                lastEvent = eventHistory[eventHistory.length - 1];
                if (
                  lastEvent.from === e.item.data.from &&
                  lastEvent.to === e.item.data.to &&
                  lastEvent.category === e.item.data.action &&
                  Math.abs(lastEvent.timestamp - timestamp) < 1000
                ) {
                  //nothing
                } else {
                  let newEvent = {
                    category: e.item.data.action,
                    timestamp: timestamp,
                    from: e.item.data.from,
                    to: e.item.data.to,
                    id: e.item.data.id,
                  } as IWhisperEventType;
                  console.log(newEvent);
                  setEventHistory([...eventHistory, newEvent]);
                }
              } else {
                let newEvent = {
                  category: e.item.data.action,
                  timestamp: timestamp,
                  from: e.item.data.from,
                  to: e.item.data.to,
                  id: e.item.data.id,
                } as IWhisperEventType;
                console.log(newEvent);

                setEventHistory([...eventHistory, newEvent]);
              }
            }

            let lastProperty = null;
            if (e.item.data.action === 'setProperty') {
              if (propertyHistory && propertyHistory.length > 0 && propertyHistory[propertyHistory.length - 1]) {
                lastProperty = propertyHistory[propertyHistory.length - 1];
                if (lastProperty.id === e.item.data.id && Math.abs(lastProperty.timestamp - timestamp) < 1000) {
                  //do nthing
                } else {
                  let newSetProperty = {
                    id: e.item.data.id,
                    timestamp: timestamp,
                    property: e.item.data.property,
                  } as SetPropertyType;
                  console.log(newSetProperty);
                  setPropertyHistory([...propertyHistory, newSetProperty]);
                }
              } else {
                let newSetProperty = {
                  id: e.item.data.id,
                  timestamp: timestamp,
                  property: e.item.data.property,
                } as SetPropertyType;
                console.log(newSetProperty);
                setPropertyHistory([...propertyHistory, newSetProperty]);
              }
            }

            if (e.item.data.action == 'whisperStart') {
              /*let newEvent = {category: e.item.data.action, timestamp: timestamp, from: e.item.data.from, to: e.item.data.to} as IWhisperEventType;
                            setEventHistory([...eventHistory, newEvent]);
                            console.log("whisperStart, from: ", e.item.data.from, ", to: ", e.item.data.to, roleNameG);
                            if (e.item.data.to === roleNameG){
                              //setIsIWhispered(true);
                              console.log("1st dgfdg");
                              setIsIWhisperedBy(e.item.data.from);

                            }*/
            }

            if (e.item.data.action == 'whisperEnd') {
              /*let newEvent = {category: e.item.data.action, timestamp: timestamp, from: e.item.data.from, to: e.item.data.to} as IWhisperEventType;
                            setEventHistory([...eventHistory, newEvent]);
                            console.log("whisperEnd, from: ", e.item.data.from, ", to: ", e.item.data.to, ", to: ",roleNameG);
                        if (e.item.data.to === roleNameG){
                              //etIsIWhispered(false);
                              setIsIWhisperedBy("");
                            }*/
            }
          });
        });
      });
  }, []);

  let contextValue = {
    error,
    setError,
    isFetching,
    activeSinkId,
    setActiveSinkId,
    settings,
    dispatchSetting,
    roomType,
    isGalleryViewActive,
    setIsGalleryViewActive,
    maxGalleryViewParticipants,
    setMaxGalleryViewParticipants,
    isKrispEnabled,
    setIsKrispEnabled,
    isKrispInstalled,
    setIsKrispInstalled,
    experimentNameG,
    setExperimentNameG,
    conditionNameG,
    setConditionNameG,
    roleNameG,
    setRoleNameG,
    isPreStage,
    setIsPreStage,
    isPiPWindowOpen,
    setIsPiPWindowOpen,
    isIWhisperWindowOpen,
    setIsIWhisperWindowOpen,
    //isIWhispered,
    //setIsIWhispered,
    isIWhisperedBy,
    setIsIWhisperedBy,
    eventHistory,
    setEventHistory,
    propertyHistory,
    setPropertyHistory,
    //   faceLandmarkProcessor,
  } as StateContextType;

  if (process.env.REACT_APP_SET_AUTH === 'firebase') {
    contextValue = {
      ...contextValue,
      ...useFirebaseAuth(), // eslint-disable-line react-hooks/rules-of-hooks
    };
  } else if (process.env.REACT_APP_SET_AUTH === 'passcode') {
    contextValue = {
      ...contextValue,
      ...usePasscodeAuth(), // eslint-disable-line react-hooks/rules-of-hooks
    };
  } else {
    contextValue = {
      ...contextValue,
      getToken: async (user_identity, room_name) => {
        const endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/token';

        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            user_identity,
            room_name,
            create_conversation: process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true',
          }),
        }).then(res => res.json());
      },
      updateRecordingRules: async (room_sid, rules) => {
        const endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/recordingrules';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_sid, rules }),
          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const recordingError = new Error(
                jsonResponse.error?.message || 'There was an error updating recording rules'
              );
              recordingError.code = jsonResponse.error?.code;
              return Promise.reject(recordingError);
            }

            return jsonResponse;
          })
          .catch(err => setError(err));
      },

      updateSubscribeRules: async (room_sid, who, rules) => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/subscribeRules';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_sid, who, rules }),
          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const recordingError = new Error(
                jsonResponse.error?.message || 'There was an error updating subscribe rules'
              );
              recordingError.code = jsonResponse.error?.code;
              return Promise.reject(recordingError);
            }

            return jsonResponse;
          })
          .catch(err => setError(err));
      },

      operateALesson: async (room_sid, toStart) => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/operateALesson';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({ room_sid, operation: toStart ? 'start' : 'end' }),

          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const recordingError = new Error(jsonResponse.error?.message || 'There was an error operating a lesson');
              recordingError.code = jsonResponse.error?.code;
              return Promise.reject(recordingError);
            }

            return jsonResponse;
          })
          .catch(err => setError(err));
      },

      ifALessonStarted: async room_sid => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/ifALessonStarted';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_sid }),
          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const recordingError = new Error(
                jsonResponse.error?.message || 'There was an error checking if a lesson is started'
              );
              recordingError.code = jsonResponse.error?.code;
              return Promise.reject(recordingError);
            }

            return jsonResponse;
          })
          .catch(err => setError(err));
      },
    };
  }

  const getToken: StateContextType['getToken'] = (name, room) => {
    setIsFetching(true);
    return contextValue
      .getToken(name, room)
      .then(res => {
        setRoomType(res.room_type);
        setIsFetching(false);
        return res;
      })
      .catch(err => {
        setError(err);
        setIsFetching(false);
        return Promise.reject(err);
      });
  };

  const updateRecordingRules: StateContextType['updateRecordingRules'] = (room_sid, rules) => {
    setIsFetching(true);
    return contextValue
      .updateRecordingRules(room_sid, rules)
      .then(res => {
        setIsFetching(false);
        return res;
      })
      .catch(err => {
        setError(err);
        setIsFetching(false);
        return Promise.reject(err);
      });
  };

  const updateSubscribeRules: StateContextType['updateSubscribeRules'] = (room_sid, who, rules) => {
    setIsFetching(true);
    return contextValue
      .updateSubscribeRules(room_sid, who, rules)
      .then(res => {
        setIsFetching(false);
        return res;
      })
      .catch(err => {
        setError(err);
        setIsFetching(false);
        return Promise.reject(err);
      });
  };

  const operateALesson: StateContextType['operateALesson'] = (room_sid, toStart) => {
    setIsFetching(true);
    return contextValue
      .operateALesson(room_sid, toStart)
      .then(res => {
        setIsFetching(false);
        return res;
      })
      .catch(err => {
        setError(err);
        setIsFetching(false);
        return Promise.reject(err);
      });
  };

  const ifALessonStarted: StateContextType['ifALessonStarted'] = room_sid => {
    setIsFetching(true);
    return contextValue
      .ifALessonStarted(room_sid)
      .then(res => {
        setIsFetching(false);
        return res;
      })
      .catch(err => {
        setError(err);
        setIsFetching(false);
        return Promise.reject(err);
      });
  };

  return (
    <StateContext.Provider
      value={{
        ...contextValue,
        getToken,
        updateRecordingRules,
        updateSubscribeRules,
        operateALesson,
        ifALessonStarted,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppStateProvider');
  }
  return context;
}
