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

interface StateWithSubject {
  state: string;
  subject: string;
}

export interface NameRole {
  role: string;
  name: string;
}

export interface WhisperInstanceType {
  id: string;
  from: string;
  to: string;
  property: string;
  ttl: number;
}

export interface StateContextType {
  error: TwilioError | Error | null;
  setError(error: TwilioError | Error | null): void;
  getToken(name: string, room: string, passcode?: string): Promise<{ room_type: RoomType; token: string }>;
  getTokenSync(): Promise<{ tokenSync: string }>;
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
  whisperAct(room_sid: string, from: string, to: string, action: string): Promise<object>;
  toggleAudio(room_sid: string, who: string, operation: string, state: string, whisperTo: string): Promise<object>;
  operateALesson(room_sid: string, toStart: boolean): Promise<object>;
  registerName(name: string, role: string): Promise<object>;
  getNameTable(room_sid: string): Promise<{ name_table: NameRole[]; status: string }>;
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
  micWarningOn: boolean;
  setMicWarningOn(micWarningOn: boolean): void;
  syncClient: SyncClient | null;
  setSyncClient(syncClient: SyncClient | null): void;
  whisperState: StateWithSubject;
  setWhisperState(whisperState: StateWithSubject): void;
  isBackdropOpen: boolean;
  setIsBackdropOpen(isBackdropOpen: boolean): void;
  nameTable: NameRole[];
  setNameTable(nameTable: NameRole[]): void;
  whisperInstanceList: WhisperInstanceType[];
  setWhisperInstanceList(whisperInstanceList: WhisperInstanceType[]): void;
  gotAWhisperWhenIWWindowClosed: boolean;
  setGotAWhisperWhenIWWindowClosed(gotAWhisperWhenIWWindowClosed: boolean): void;
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
    8
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
  const [micWarningOn, setMicWarningOn] = useState<boolean>(false);
  const [syncClient, setSyncClient] = useState<SyncClient | null>(null);
  const [whisperState, setWhisperState] = useState<StateWithSubject>({
    state: 'IDLE',
    subject: roleNameG,
  });
  const [isBackdropOpen, setIsBackdropOpen] = useState<boolean>(false);
  const [whisperInstanceList, setWhisperInstanceList] = useState<WhisperInstanceType[]>([]);
  const [gotAWhisperWhenIWWindowClosed, setGotAWhisperWhenIWWindowClosed] = useState<boolean>(false);

  const initNameTable: NameRole[] = [
    { role: 'Teacher', name: 'Teacher' },
    { role: 'Researcher', name: 'Researcher' },
    { role: 'Student 1', name: 'Student 1' },
    { role: 'Student 2', name: 'Student 2' },
    { role: 'Student 3', name: 'Student 3' },
    { role: 'Student 4', name: 'Student 4' },
    { role: 'Student 5', name: 'Student 5' },
    { role: 'Student 6', name: 'Student 6' },
  ];
  const [nameTable, setNameTable] = useState<NameRole[]>(initNameTable);
  /*useEffect(() => {
    //fetch('https://34.222.53.145:5000/token', { method: 'POST' })
    fetch('https://192.168.3.5:3000/tokenSync', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        const syncClient = new SyncClient(data.token);
        
      });
  }, []);*/

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
    micWarningOn,
    setMicWarningOn,
    syncClient,
    setSyncClient,
    whisperState,
    setWhisperState,
    isBackdropOpen,
    setIsBackdropOpen,
    nameTable,
    setNameTable,
    whisperInstanceList,
    setWhisperInstanceList,
    gotAWhisperWhenIWWindowClosed,
    setGotAWhisperWhenIWWindowClosed,
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
      getTokenSync: async () => {
        const endpoint = '/tokenSync';

        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
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

      whisperAct: async (room_sid, from, to, action) => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/whisperAct';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_sid, from, to, action }),
          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const whisperError = new Error(
                jsonResponse.error?.message || 'There was an error updating whisper states'
              );
              whisperError.code = jsonResponse.error?.code;
              return Promise.reject(whisperError);
            }

            return jsonResponse;
          })
          .catch(err => setError(err));
      },

      toggleAudio: async (room_sid, who, operation, state, whisperTo) => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/toggleAudio';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_sid, who, operation, state, whisperTo }),
          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const toggleError = new Error(jsonResponse.error?.message || 'There was an error toggling audio');
              toggleError.code = jsonResponse.error?.code;
              return Promise.reject(toggleError);
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

      registerName: async (name, role) => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/registerName';

        return fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({ name, role }),

          method: 'POST',
        })
          .then(async res => {
            const jsonResponse = await res.json();

            if (!res.ok) {
              const recordingError = new Error(
                jsonResponse.error?.message || 'There was an error registering the name'
              );
              recordingError.code = jsonResponse.error?.code;
              return Promise.reject(recordingError);
            }

            return jsonResponse;
          })
          .catch(err => setError(err));
      },

      getNameTable: async room_sid => {
        console.log(process.env.REACT_APP_TOKEN_ENDPOINT);
        const endpoint = '/getNameTable';

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
                jsonResponse.error?.message || 'There was an error fetching the name table'
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

  const getTokenSync: StateContextType['getTokenSync'] = () => {
    setIsFetching(true);
    return contextValue
      .getTokenSync()
      .then(res => {
        //const syncClient_ = new SyncClient(res.tokenSync);
        //setSyncClient(syncClient_);

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

  const whisperAct: StateContextType['whisperAct'] = (room_sid, from, to, action) => {
    setIsFetching(true);
    return contextValue
      .whisperAct(room_sid, from, to, action)
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

  const toggleAudio: StateContextType['toggleAudio'] = (room_sid, who, operation, state, whisperTo) => {
    setIsFetching(true);
    return contextValue
      .toggleAudio(room_sid, who, operation, state, whisperTo)
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

  const registerName: StateContextType['registerName'] = (name, role) => {
    setIsFetching(true);
    return contextValue
      .registerName(name, role)
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

  const getNameTable: StateContextType['getNameTable'] = room_sid => {
    setIsFetching(true);
    return contextValue
      .getNameTable(room_sid)
      .then(res => {
        setIsFetching(false);
        console.log('get name table, ', res);
        if (Array.isArray(res.name_table)) {
          var newTable_: NameRole[] = [];
          res.name_table.forEach(n => {
            console.log(n);
            const newNameRole: NameRole = { name: n.name, role: n.role };
            newTable_.push(newNameRole);
          });
          console.log(newTable_);
          setNameTable(newTable_);
        }
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
        whisperAct,
        toggleAudio,
        operateALesson,
        ifALessonStarted,
        registerName,
        getNameTable,
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
