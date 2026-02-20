import {useContext} from "react";
import {RoomContext, RTCContext} from "../../contexts";
import TrashIcon from "../../icons/trash-icon";
import {RTCEventType} from "../../../rtc/connection-manager";
import {SignalingMessageType, SignalingPeerList} from "../../../rtc/signaling/messages";

export default function PersistedRooms() {
  const {persistedRooms, setPersistedRooms, setRoomCode, setRoomId} = useContext(RoomContext);
  const { rtcConnectionManager } = useContext(RTCContext);

  function joinRoom(roomId: string) {
    rtcConnectionManager?.addEventListener(RTCEventType.Message, ({message}, callbackId) => {
      console.log("joinRoom", message, roomId);
      const peerListMessage = (message as SignalingPeerList);
      if (peerListMessage.roomId === roomId) {
        setRoomCode(peerListMessage.roomCode);
        setRoomId(peerListMessage.roomId);

        rtcConnectionManager?.removeEventListener(
          RTCEventType.Message,
          callbackId,
          { messageType: SignalingMessageType.PeerList}
        );
      }
    }, { messageType: SignalingMessageType.PeerList });

    rtcConnectionManager?.joinOrCreateRoom(roomId);
  }

  function deleteRoom(roomId: string, event: any) {

    setPersistedRooms(prev => {
      const tmp = new Map(prev.entries());

      tmp.delete(roomId);

      return tmp;
    })
    event.stopPropagation();
  }

  return (
    Array.from(persistedRooms.keys()).length > 0 &&
    <div className="d-flex flex-column mt-4 h-100 min-h0 flex-1">
      <table className="table table-selectable w-100 d-flex flex-column min-h0 flex-1">
        <thead className="d-block">
        <tr className="d-flex">
          <th className="flex-1">Old Rooms</th>
          <th></th>
        </tr>
        </thead>
        <tbody className="d-block overflow-md-auto flex-shrink-1 flex-grow-1 min-h0">
        {Array.from(persistedRooms.values()).map(room =>
          <tr key={room.id} className="d-flex" onClick={() => joinRoom(room.id)}>
            <td className="flex-1">{room.name}</td>
            <td><div className="text-danger" onClick={e => deleteRoom(room.id, e)}><TrashIcon width={24} height={24}/></div></td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  )
}
