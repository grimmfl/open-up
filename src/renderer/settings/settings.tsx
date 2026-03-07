import DeviceSelect from "./device-select";
import {useContext} from "react";
import { AppContext, DeviceContext} from "../contexts";
import UserInfoSettings from "./user-info/user-info-settings";

export default function Settings() {
  const {audioInputDeviceId, setAudioInputDeviceId, audioOutputDeviceId, setAudioOutputDeviceId} = useContext(DeviceContext);

  const {version} = useContext(AppContext);


  return (
    <div>
      <div>
        <h5>General</h5>
        <UserInfoSettings></UserInfoSettings>
      </div>

      <div className="mt-5">
        <h5>Audio - Input</h5>
        <DeviceSelect deviceKind={'audioinput'} onSelect={setAudioInputDeviceId} initial={audioInputDeviceId}/>
      </div>

      <div className="mt-5">
        <h5>Audio - Output</h5>
        <DeviceSelect deviceKind={'audiooutput'} onSelect={setAudioOutputDeviceId} initial={audioOutputDeviceId}/>
      </div>

      <div className="mt-5">
        <h5>Info</h5>
        <table className="table">
          <tbody>
          <tr>
            <td>Version</td>
            <td>v{ version }</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
