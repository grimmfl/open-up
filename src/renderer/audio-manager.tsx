import {ReactElement, useContext, useEffect, useState} from "react";
import {DeviceContext, RTCContext} from "./contexts";
import {RTCEventType} from "../rtc/connection-manager";

export default function AudioManager({children}: { children: ReactElement }) {
  const { audioInputDeviceId, audioOutputDeviceId, isOutputMuted, isInputMuted } = useContext(DeviceContext);
  const { rtcConnectionManager } = useContext(RTCContext);

  const [ outputAudios, setOutputAudios ] = useState(new Map<string, HTMLAudioElement>());

  useEffect(() => {
    if (rtcConnectionManager == null || audioInputDeviceId == null) return;

    navigator.mediaDevices
      .getUserMedia({audio: {deviceId: audioInputDeviceId}})
      .then(async stream => {
        rtcConnectionManager.setAudioInput(stream);
      });
  }, [audioInputDeviceId, rtcConnectionManager]);

  useEffect(() => {
    if (rtcConnectionManager == null || audioOutputDeviceId == null) return;

    setOutputAudios(audios => {
      audios.forEach(async audio => await audio.setSinkId(audioOutputDeviceId));

      return audios;
    });

    // TODO close audio on connection close
    rtcConnectionManager.addEventListener(RTCEventType.RemoteStream, async ({ peer, remoteStream }) => {
      setOutputAudios(audios => {
        const audio = audios.get(peer!) ?? new Audio();
        audio.autoplay = true;
        audio.srcObject = remoteStream!;
        audio.setSinkId(audioOutputDeviceId).then();

        audios.set(peer!, audio);

        return audios;
      })
    });
  }, [audioOutputDeviceId, rtcConnectionManager]);

  useEffect(() => {
    setOutputAudios(audios => {
      audios.forEach(audio => audio.volume = isOutputMuted ? 0 : 1);

      return audios;
    });
  }, [isOutputMuted]);

  useEffect(() => {
    rtcConnectionManager?.setMuted(isInputMuted || isOutputMuted);
  }, [isInputMuted, isOutputMuted]);

  return (
    <div>
      { children }
    </div>
  );
}
