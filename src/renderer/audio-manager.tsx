import { type ReactElement, useContext, useEffect, useState } from 'react';
import {
  DeviceContext,
  PeerSettingsContext,
  RoomContext,
  RTCContext,
  UserContext,
} from './contexts';
import { RTCEventType } from '../rtc/connection-manager';
import { alterMapState } from '../shared/utils';

interface UserAudio {
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  gain: GainNode;
  dataArray: Uint8Array<ArrayBuffer>;
}

export default function AudioManager({ children }: { children: ReactElement }) {
  const {
    audioInputDeviceId,
    audioOutputDeviceId,
    isOutputMuted,
    isInputMuted,
  } = useContext(DeviceContext);
  const { rtcConnectionManager } = useContext(RTCContext);
  const { peers } = useContext(PeerSettingsContext);
  const { setPeerVolumes } = useContext(RoomContext);
  const { clientId } = useContext(UserContext);
  const { inputThreshold } = useContext(DeviceContext);

  const [outputAudios, setOutputAudios] = useState(
    new Map<string, UserAudio>(),
  );

  const [audioContext] = useState<AudioContext>(() => new AudioContext());

  useEffect(() => {
    function getVolume(audio: UserAudio): number {
      audio.analyser.getByteFrequencyData(audio.dataArray);

      let sum = 0;
      for (const amplitude of audio.dataArray) {
        sum += amplitude * amplitude;
      }

      return Math.sqrt(sum / audio.dataArray.length);
    }

    function applyInputThreshold() {
      if (clientId == null) return;
      const input = outputAudios.get(clientId);

      if (input == null) return;

      const volume = getVolume(input);

      input.gain.gain.setValueAtTime(
        volume > inputThreshold ? 1 : 0,
        audioContext.currentTime,
      );
    }

    function calculateVolume() {
      applyInputThreshold();

      for (const [peer, audio] of outputAudios.entries()) {
        setPeerVolumes((prev) =>
          alterMapState(prev, (peers) => peers.set(peer, getVolume(audio))),
        );
      }

      requestAnimationFrame(() => calculateVolume());
    }

    calculateVolume();
  }, []);

  useEffect(() => {
    if (rtcConnectionManager == null || audioInputDeviceId == null) return;

    navigator.mediaDevices
      .getUserMedia({ audio: { deviceId: audioInputDeviceId } })
      .then(async (stream) => {
        setOutputAudios((audios) => {
          const audio = audios.get(clientId!);

          if (audio != null) {
            audio.source.disconnect();
            audio.analyser.disconnect();
            audio.gain.disconnect();
          }

          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          const gain = audioContext.createGain();
          const target = audioContext.createMediaStreamDestination();

          source.connect(analyser);
          analyser.connect(gain);
          gain.connect(target);

          rtcConnectionManager.setAudioInput(target.stream);

          audios.set(clientId!, {
            source,
            analyser,
            gain,
            dataArray: new Uint8Array(analyser.frequencyBinCount),
          });

          return audios;
        });
      });
  }, [audioInputDeviceId, rtcConnectionManager]);

  useEffect(() => {
    if (rtcConnectionManager == null) return;

    // TODO close audio on connection close
    rtcConnectionManager.addEventListener(
      RTCEventType.RemoteStream,
      async ({ peer, remoteStream }) => {
        setOutputAudios((audios) => {
          const peerSettings = peer != null ? peers.get(peer) : undefined;

          const audio = audios.get(peer!);

          if (audio != null) {
            audio.source.disconnect();
            audio.analyser.disconnect();
            audio.gain.disconnect();
          }

          const source = audioContext.createMediaStreamSource(remoteStream!);
          const analyser = audioContext.createAnalyser();
          const gain = audioContext.createGain();

          source.connect(analyser);
          analyser.connect(gain);
          gain.connect(audioContext.destination);

          gain.gain.setValueAtTime(
            Math.min(peerSettings?.volume ?? 100, 100) / 100,
            audioContext.currentTime,
          );

          audios.set(peer!, {
            source,
            analyser,
            gain,
            dataArray: new Uint8Array(analyser.frequencyBinCount),
          });

          return audios;
        });
      },
    );
  }, [rtcConnectionManager]);

  useEffect(() => {
    if (audioOutputDeviceId == null) return;

    (audioContext as any).setSinkId(audioOutputDeviceId);
  }, [audioOutputDeviceId]);

  useEffect(() => {
    setOutputAudios((audios) => {
      for (const peer of peers.values()) {
        const audio = audios.get(peer.clientId);

        if (!audio) continue;

        audio.gain.gain.setValueAtTime(
          Math.min(peer.volume, 100) / 100,
          audioContext.currentTime,
        );
      }

      return audios;
    });
  }, [peers]);

  useEffect(() => {
    setOutputAudios((audios) => {
      audios.forEach((audio) =>
        audio.gain.gain.setValueAtTime(
          isOutputMuted ? 0 : 1,
          audioContext.currentTime,
        ),
      );

      return audios;
    });
  }, [isOutputMuted]);

  useEffect(() => {
    rtcConnectionManager?.setMuted(isInputMuted || isOutputMuted);
  }, [isInputMuted, isOutputMuted]);

  return <div>{children}</div>;
}
