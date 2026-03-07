import DeviceSelect from "./device-select";
import {useContext} from "react";
import {DeviceContext} from "../contexts";
import UserInfoSettings from "./user-info/user-info-settings";

export default function Settings() {
  const {audioInputDeviceId, setAudioInputDeviceId, audioOutputDeviceId, setAudioOutputDeviceId} = useContext(DeviceContext);



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
    </div>
  );
}
