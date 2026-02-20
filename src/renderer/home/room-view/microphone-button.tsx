import MicrophoneIcon from "../../icons/microphone-icon";
import {useContext} from "react";
import {DeviceContext, RTCContext} from "../../contexts";
import MicrophoneOffIcon from "../../icons/microphone-off-icon";

export default function MicrophoneButton() {
  const {isInputMuted, isOutputMuted, setIsInputMuted, setIsOutputMuted} = useContext(DeviceContext);

  function unmute() {
    setIsInputMuted(false);
    setIsOutputMuted(false);
  }

  function mute() {
    setIsInputMuted(true);
  }

  return (
    isInputMuted || isOutputMuted
      ?
      <button className="btn btn-borderless p-2 text-danger" onClick={unmute}>
        <MicrophoneOffIcon/>
      </button>
      :
      <button className="btn btn-borderless p-2" onClick={mute}>
        <MicrophoneIcon/>
      </button>
  );
}
