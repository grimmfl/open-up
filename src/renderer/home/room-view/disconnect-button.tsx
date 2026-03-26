import {useContext} from "react";
import {MessageContext, RoomContext, RTCContext} from "../../contexts";
import PhoneOffIcon from "../../icons/phone-off-icon";

export default function DisconnectButton() {
  const {setRoomCodeInput, setRoomCode, setRoomId, roomId, setPeerNames} = useContext(RoomContext);
  const {rtcConnectionManager, rtcMessageHandler} = useContext(RTCContext);
  const {setMessageList} = useContext(MessageContext);

  function disconnect() {
    setRoomCodeInput('');
    setRoomCode('');
    setRoomId(null);
    setPeerNames(new Map<string, string>());
    rtcConnectionManager?.leaveRoom();
    rtcMessageHandler?.leaveRoom();
    setMessageList([]);
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
