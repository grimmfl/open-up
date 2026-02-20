import {useContext} from "react";
import {RoomContext, RTCContext} from "../../contexts";
import {SignalingMessageType, SignalingPeerList} from "../../../rtc/signaling/messages";
import {RTCEventType} from "../../../rtc/connection-manager";
import {generateRoomCode} from "../../../shared/room-code-generator";
import {alterMapState} from "../../../shared/utils";

export default function CreateRoomButton() {
  const {rtcConnectionManager} = useContext(RTCContext);

  const {roomCode, setRoomCode, setPersistedRooms, setRoomId} = useContext(RoomContext);

  function createRoom() {
    const code = generateRoomCode();

    rtcConnectionManager?.addEventListener(RTCEventType.Message, ({message}, callbackId) => {
      const peerListMessage = (message as SignalingPeerList);

      if (peerListMessage.roomCode === code) {
        setRoomCode(code);
        setRoomId(peerListMessage.roomId);

        setPersistedRooms(prev => alterMapState(prev, m => {
          m.set(peerListMessage.roomId, {
            id: peerListMessage.roomId,
            name: 'Unnamed'
          });
        }));

        rtcConnectionManager?.removeEventListener(
          RTCEventType.Message,
          callbackId,
          {messageType: SignalingMessageType.PeerList}
        );
      }
    }, {messageType: SignalingMessageType.PeerList});

    rtcConnectionManager?.createRoom(code);
  }

  // TODO show tooltip that room was copied
  return (
    <button className="btn mt-5 text-center" onClick={createRoom}>Create Room</button>
  );
}
