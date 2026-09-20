import { useContext, useEffect, useRef } from 'react';
import DeviceSelect from './device-select';
import {
  AppContext,
  DeviceContext,
  RoomContext,
  UserContext,
} from '../contexts';
import UserInfoSettings from './user-info/user-info-settings';

export default function Settings() {
  const {
    audioInputDeviceId,
    setAudioInputDeviceId,
    audioOutputDeviceId,
    setAudioOutputDeviceId,
  } = useContext(DeviceContext);

  const { version } = useContext(AppContext);
  const { clientId } = useContext(UserContext);
  const { peerVolumes } = useContext(RoomContext);
  const { inputThreshold, setInputThreshold } = useContext(DeviceContext);

  const inputThresholdSliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const slider = inputThresholdSliderRef.current;

    if (clientId == null || slider == null) return;

    const volume = peerVolumes.get(clientId) ?? 0;

    slider.style.setProperty('--volume', `${volume}%`);
  }, [peerVolumes, clientId, inputThresholdSliderRef]);

  function exportSettings() {
    window.electron.ipcRenderer.sendMessage('export-settings');
  }

  function importSettings() {
    window.electron.ipcRenderer.sendMessage('import-settings');
  }

  return (
    <div>
      <div>
        <h5>General</h5>
        <UserInfoSettings />
      </div>

      <div className="mt-5">
        <h5>Audio - Input</h5>
        <DeviceSelect
          deviceKind="audioinput"
          onSelect={setAudioInputDeviceId}
          initial={audioInputDeviceId}
        />

        <input
          id="input-threshold-slider"
          type="range"
          value={inputThreshold}
          onChange={(e) => setInputThreshold(e.target.valueAsNumber)}
          min={0}
          max={100}
          className="w-100"
          ref={inputThresholdSliderRef}
        />
      </div>

      <div className="mt-5">
        <h5>Audio - Output</h5>
        <DeviceSelect
          deviceKind="audiooutput"
          onSelect={setAudioOutputDeviceId}
          initial={audioOutputDeviceId}
        />
      </div>

      <div className="mt-5 d-flex justify-content-between gap-2">
        <button
          type="button"
          className="btn flex-grow-1"
          onClick={importSettings}
        >
          Import
        </button>
        <button
          type="button"
          className="btn flex-grow-1"
          onClick={exportSettings}
        >
          Export
        </button>
      </div>

      <div className="mt-5">
        <h5>About</h5>
        <table className="table">
          <tbody>
            <tr>
              <td>Version</td>
              <td>v{version}</td>
            </tr>
            <tr>
              <td>License</td>
              <td>
                <a
                  href="https://github.com/grimmfl/open-up/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                >
                  MIT
                </a>
              </td>
            </tr>
            <tr>
              <td>Source Code</td>
              <td>
                <a
                  href="https://github.com/grimmfl/open-up"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
              </td>
            </tr>
            <tr>
              <td>Third Party Licenses</td>
              <td>
                <a
                  href="https://github.com/grimmfl/open-up/blob/main/THIRD_PARTY_NOTICES.txt"
                  target="_blank"
                  rel="noreferrer"
                >
                  THIRD_PARTY_NOTICES.txt
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
