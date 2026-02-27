import {ReactElement, useEffect, useRef, useState} from "react";
import {DeviceContext, MessageContext, RoomContext, RTCContext, UserContext, UserInfoSettingsContext} from "./contexts";
import {RTCConnectionManager, RTCEventType} from "../rtc/connection-manager";
import AudioManager from "./audio-manager";
import {Message} from "./home/message-view/message-card";
import {PeerInformation, RTCMessageHandler} from "../rtc/message-handler";
import {PersistenceData, RoomPersistenceData, validateData} from "../shared/data";


function getDefaultDevice(devices: MediaDeviceInfo[], kind: MediaDeviceKind) {
  const kindDevices = devices.filter(d => d.kind === kind);

  const candidate = kindDevices
    .find(d => d.label.toLowerCase().includes('default'));

  return candidate ?? kindDevices.length > 0 ? kindDevices[0].deviceId : null;
}

export default function State({children}: { children: ReactElement }) {
  // ---------------------- DeviceContext ----------------------
  const [audioInputDeviceId, setAudioInputDeviceId] = useState<string | null>(null);
  const [audioOutputDeviceId, setAudioOutputDeviceId] = useState<string | null>(null);
  const [isInputMuted, setIsInputMuted] = useState<boolean>(false);
  const [isOutputMuted, setIsOutputMuted] = useState<boolean>(false);

  // ---------------------- RTCContext ----------------------
  const [rtcConnectionManager, setRtcConnectionManager] = useState<RTCConnectionManager | null>(null);
  const [rtcMessageHandler, setRtcMessageHandler] = useState<RTCMessageHandler | null>(null);

  // ---------------------- MessageContext ----------------------
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');

  // ---------------------- RoomContext ----------------------
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerNames, setPeerNames] = useState(new Map<string, string>());
  const [persistedRooms, setPersistedRooms] = useState(new Map<string, RoomPersistenceData>());

  // ---------------------- UserContext ----------------------
  const [userName, setUserName] = useState<string>('');
  const [clientId, setClientId] = useState<string | null>(null);

  // ---------------------- UserInfoSettingsContext ----------------------
  const [userNameInput, setUserNameInput] = useState<string>('');

  const informationRef = useRef({ name: userName, clientId: clientId ?? '' } as PeerInformation);

  useEffect(() => {
    window.electron.ipcRenderer.on('load-data', input => {
      const data = validateData(input);

      if (data == null) return;

      setUserName(data.user.name);
      setAudioInputDeviceId(data.devices.inputDeviceId);
      setAudioOutputDeviceId(data.devices.outputDeviceId);
      setPersistedRooms(new Map(data.rooms.map(r => [r.id, r])));
    });

    window.electron.ipcRenderer.sendMessage('load-data');

    navigator.mediaDevices.enumerateDevices().then(allDevices => {
      setAudioInputDeviceId(prev => prev != null ? prev : getDefaultDevice(allDevices, 'audioinput'));
      setAudioOutputDeviceId(prev => prev != null ? prev : getDefaultDevice(allDevices, 'audiooutput'));

      const connectionManager = new RTCConnectionManager(window.signalingUrl);
      const messageHandler = new RTCMessageHandler();

      messageHandler.addChatEventListener((sender, message) => {
        setMessageList(prev => [...prev, {
          fromMe: false,
          sender,
          message
        }])
      });

      messageHandler.addInformationEventListener(information => {
        setPeerNames(prev => {
          const tmp = new Map(prev.entries());

          tmp.set(information.clientId, information.name);

          return tmp;
        })
      });

      connectionManager.addEventListener(RTCEventType.ClientId, event => {
        setClientId(event.clientId!);
        setUserName(prev => prev.trim().length === 0 ? event.clientId! : prev);
      })

      connectionManager.addEventListener(RTCEventType.ChatChannel, event => {
        messageHandler.addChatChannel(event.peer!, event.dataChannel!);
      });

      connectionManager.addEventListener(RTCEventType.InformationChannel, event => {
        messageHandler.addInformationChannel(event.peer!, event.dataChannel!);
        messageHandler.sendInformation(informationRef.current, event.peer!);
      });

      connectionManager.addEventListener(RTCEventType.Disconnected, event => {
        messageHandler.removeChannels(event.peer!);
        setPeerNames(prev => {
          const tmp = new Map(prev.entries());

          tmp.delete(event.peer!);

          return tmp;
        })
      })

      setRtcConnectionManager(connectionManager);
      setRtcMessageHandler(messageHandler);
    });
  }, []);

  useEffect(() => {
    if (rtcMessageHandler == null) return;

    setUserNameInput(userName);

    informationRef.current = { name: userName, clientId: clientId ?? '' };

    rtcMessageHandler.sendInformation(informationRef.current);
  }, [userName, clientId]);

  useEffect(() => {
    if (audioInputDeviceId == null || audioOutputDeviceId == null) return;

    const data: PersistenceData = {
      user: {
        name: userName,
      },
      devices: {
        inputDeviceId: audioInputDeviceId,
        outputDeviceId: audioOutputDeviceId,
      },
      rooms: Array.from(persistedRooms.values())
    }

    window.electron.ipcRenderer.sendMessage('save-data', data);
  }, [userName, audioInputDeviceId, audioOutputDeviceId, persistedRooms]);

  return (
    <DeviceContext value={{
      audioInputDeviceId: audioInputDeviceId,
      setAudioInputDeviceId: setAudioInputDeviceId,
      isInputMuted,
      setIsInputMuted,
      audioOutputDeviceId: audioOutputDeviceId,
      setAudioOutputDeviceId: setAudioOutputDeviceId,
      isOutputMuted,
      setIsOutputMuted,
    }}>
      <RTCContext value={{
        rtcConnectionManager,
        setRtcConnectionManager,
        rtcMessageHandler,
        setRtcMessageHandler
      }}>
        <MessageContext value={{
          messageList,
          setMessageList,
          messageInput,
          setMessageInput
        }}>
          <RoomContext value={{
            roomCodeInput,
            setRoomCodeInput,
            roomId,
            setRoomId,
            roomCode,
            setRoomCode,
            peerNames,
            setPeerNames,
            persistedRooms,
            setPersistedRooms
          }}>
            <UserContext value={{
              userName,
              setUserName,
              clientId,
              setClientId
            }}>
              <UserInfoSettingsContext value={{
                userNameInput,
                setUserNameInput
              }}>
                <AudioManager>
                  {children}
                </AudioManager>
              </UserInfoSettingsContext>
            </UserContext>
          </RoomContext>
        </MessageContext>
      </RTCContext>
    </DeviceContext>
  );
}
