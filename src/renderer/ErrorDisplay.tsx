import { useContext, useEffect, useState } from 'react';
import { RTCContext } from './contexts';
import {
  type SignalingError,
  SignalingMessageType,
} from '../rtc/signaling/messages';
import { RTCEventType } from '../rtc/connection-manager';
import { alterMapState } from '../shared/utils';

export default function ErrorDisplay() {
  const { rtcConnectionManager } = useContext(RTCContext);

  const [errors, setErrors] = useState(new Map<string, string>());

  function addError(message: string) {
    const id = crypto.randomUUID().toString();

    setErrors((prev) =>
      alterMapState(prev, (errors) => errors.set(id, message)),
    );

    setTimeout(() => {
      setErrors((prev) => alterMapState(prev, (errors) => errors.delete(id)));
    }, 3000);
  }

  useEffect(() => {
    if (rtcConnectionManager == null) return;

    rtcConnectionManager.addEventListener(
      RTCEventType.Message,
      ({ message }) => addError((message as SignalingError).message),
      { messageType: SignalingMessageType.Error },
    );
  }, [rtcConnectionManager]);

  useEffect(() => {
    window.electron.ipcRenderer.on('error', (data) => {
      addError(data as string);
    });
  }, []);

  return (
    <div className="position-absolute start-50">
      {Array.from(errors.values()).map((error, index) => (
        <div
          key={`error${index}`}
          className="text-white bg-danger p-3 mt-3 border-rounded"
        >
          {error}
        </div>
      ))}
    </div>
  );
}
