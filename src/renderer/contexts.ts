import {createContext, Dispatch, SetStateAction} from "react";
import {RTCConnectionManager} from "../rtc/connection-manager";
import {Message} from "./home/message-view/message-card";
import {RTCMessageHandler} from "../rtc/message-handler";
import {RoomPersistenceData} from "../shared/data";


// ---------------------- DeviceContext ----------------------
export const DeviceContext = createContext<{
  audioInputDeviceId: string | null,
  setAudioInputDeviceId: Dispatch<SetStateAction<string | null>>,
  isInputMuted: boolean,
  setIsInputMuted: Dispatch<SetStateAction<boolean>>,
  audioOutputDeviceId: string | null,
  setAudioOutputDeviceId: Dispatch<SetStateAction<string | null>>,
  isOutputMuted: boolean,
  setIsOutputMuted: Dispatch<SetStateAction<boolean>>,
}>({
  audioInputDeviceId: null,
  setAudioInputDeviceId: () => {
  },
  isInputMuted: false,
  setIsInputMuted: () => {},
  audioOutputDeviceId: null,
  setAudioOutputDeviceId: () => {
  },
  isOutputMuted: false,
  setIsOutputMuted: () => {}
});

// ---------------------- RTCConnectionManagerContext ----------------------
export const RTCContext = createContext<{
  rtcConnectionManager: RTCConnectionManager | null,
  setRtcConnectionManager: Dispatch<SetStateAction<RTCConnectionManager | null>>,
  rtcMessageHandler: RTCMessageHandler | null,
  setRtcMessageHandler: Dispatch<SetStateAction<RTCMessageHandler | null>>,
}>({
  rtcConnectionManager: null,
  setRtcConnectionManager: () => {},
  rtcMessageHandler: null,
  setRtcMessageHandler: () => {},
});

// ---------------------- MessageContext ----------------------
export const MessageContext = createContext<{
  messageList: Message[]
  setMessageList: Dispatch<SetStateAction<Message[]>>,
  messageInput: string,
  setMessageInput: Dispatch<SetStateAction<string>>,
}>({
  messageList: [],
  setMessageList: () => {},
  messageInput: '',
  setMessageInput: () => {},
});

// ---------------------- RoomCodeContext ----------------------
export const RoomContext = createContext<{
  roomCodeInput: string,
  setRoomCodeInput: Dispatch<SetStateAction<string>>,
  roomCode: string,
  setRoomCode: Dispatch<SetStateAction<string>>,
  roomId: string | null,
  setRoomId: Dispatch<SetStateAction<string | null>>,
  peerNames: Map<string, string>,
  setPeerNames: Dispatch<SetStateAction<Map<string, string>>>,
  persistedRooms: Map<string, RoomPersistenceData>,
  setPersistedRooms: Dispatch<SetStateAction<Map<string, RoomPersistenceData>>>,
}>({
  roomCodeInput: '',
  setRoomCodeInput: () => {},
  roomCode: '',
  setRoomCode: () => {},
  roomId: null,
  setRoomId: () => {},
  peerNames: new Map<string, string>(),
  setPeerNames: () => {},
  persistedRooms: new Map<string, RoomPersistenceData>(),
  setPersistedRooms: () => {}
});

// ---------------------- UserContext ----------------------
export const UserContext = createContext<{
  clientId: string | null,
  setClientId: Dispatch<SetStateAction<string | null>>,
  userName: string,
  setUserName: Dispatch<SetStateAction<string>>
}>({
  userName: '',
  setUserName: () => {},
  clientId: null,
  setClientId: () => {},
});

// ---------------------- UserInfoSettingsContext ----------------------
export const UserInfoSettingsContext = createContext<{
  userNameInput: string,
  setUserNameInput: Dispatch<SetStateAction<string>>,
}>({
  userNameInput: '',
  setUserNameInput: () => {}
});
