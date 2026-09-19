import { useContext } from 'react';
import DeviceSelect from './device-select';
import { AppContext, DeviceContext } from '../contexts';
import UserInfoSettings from './user-info/user-info-settings';

export default function Settings() {
  const {
    audioInputDeviceId,
    setAudioInputDeviceId,
    audioOutputDeviceId,
    setAudioOutputDeviceId,
  } = useContext(DeviceContext);

  const { version } = useContext(AppContext);

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
      </div>

      <div className="mt-5">
        <h5>Audio - Output</h5>
        <DeviceSelect
          deviceKind="audiooutput"
          onSelect={setAudioOutputDeviceId}
          initial={audioOutputDeviceId}
        />
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
