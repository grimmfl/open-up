import {useContext} from "react";
import {RoomContext, RTCContext} from "../../contexts";
import {RTCEventType} from "../../../rtc/connection-manager";
import {SignalingMessageType, SignalingPeerList} from "../../../rtc/signaling/messages";
import {alterMapState} from "../../../shared/utils";

export default function JoinRoomButton() {
  const {rtcConnectionManager} = useContext(RTCContext);

  const {roomCodeInput, setRoomCodeInput, setRoomCode, setRoomId, setPersistedRooms} = useContext(RoomContext);

  function joinRoom() {
    const room = roomCodeInput.toUpperCase();

    if (!/[A-Z0-9]{4}/.test(room)) {
      return; // TODO throw error
    }

    rtcConnectionManager?.addEventListener(RTCEventType.Message, ({message}, callbackId) => {
      const peerListMessage = (message as SignalingPeerList);
      if (peerListMessage.roomCode === room) {
        setRoomCode(room);
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

    rtcConnectionManager?.joinRoom(room);
  }

  return (
    <div className="d-flex flex-column">
      <input className="form-control" placeholder="Room Code . . ." onChange={e => setRoomCodeInput(e.target.value)}/>
      <button className="btn mt-2" onClick={joinRoom}>Join Room</button>
    </div>
  )
}
