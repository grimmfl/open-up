import { useContext } from 'react';
import { DeviceContext } from '../../contexts';
import SoundIcon from '../../icons/sound-icon';
import SoundOffIcon from '../../icons/sound-off-icon';

export default function SoundButton() {
  const { isOutputMuted, setIsOutputMuted } = useContext(DeviceContext);

  function mute() {
    setIsOutputMuted(true);
  }

  function unmute() {
    setIsOutputMuted(false);
  }

  return isOutputMuted ? (
    <button className="btn btn-borderless p-2 text-danger" onClick={unmute}>
      <SoundOffIcon />
    </button>
  ) : (
    <button className="btn btn-borderless p-2" onClick={mute}>
      <SoundIcon />
    </button>
  );
}
