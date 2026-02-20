import {useContext} from "react";
import {RoomContext} from "../../contexts";
import {alterMapState} from "../../../shared/utils";

export default function RoomNameInput() {
  const { roomId, persistedRooms, setPersistedRooms } = useContext(RoomContext);

  function changeRoomName(input: string) {
    if (input.trim().length === 0) return;

    setPersistedRooms(prev => alterMapState(prev, m => {
      m.set(roomId!, {
        id: roomId!,
        name: input,
      })
    }))
  }

  return (
    roomId &&
    <input className="form-control"
           value={persistedRooms.get(roomId)?.name ?? 'Unnamed'}
           onChange={e => changeRoomName(e.target.value)} />
  )
}
