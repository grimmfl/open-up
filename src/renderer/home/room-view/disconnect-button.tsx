import {useContext} from "react";
import {RoomContext, RTCContext} from "../../contexts";
import MicrophoneIcon from "../../icons/microphone-icon";
import PhoneOffIcon from "../../icons/phone-off-icon";

export default function DisconnectButton() {
  const {setRoomCodeInput, roomCode, setRoomCode, setRoomId, roomId, setPeerNames} = useContext(RoomContext);
  const {rtcConnectionManager, rtcMessageHandler} = useContext(RTCContext);

  function disconnect() {
    setRoomCodeInput('');
    setRoomCode('');
    setRoomId(null),
    setPeerNames(new Map<string, string>());
    rtcConnectionManager?.leaveRoom();
    rtcMessageHandler?.leaveRoom();
  }

  return (
    roomId != null
      ?
      <button className="btn btn-borderless p-2 text-danger" onClick={disconnect}>
        <PhoneOffIcon/>
      </button>
      :
      <button className="btn btn-borderless p-2" disabled>
        <PhoneOffIcon/>
      </button>
  );
}
