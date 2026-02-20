import {useContext, useEffect, useState} from "react";
import {RTCContext} from "./contexts";
import {SignalingError, SignalingMessageType} from "../rtc/signaling/messages";
import {RTCEventType} from "../rtc/connection-manager";

export default function ErrorDisplay() {
  const { rtcConnectionManager } = useContext(RTCContext);

  const [errors, setErrors] = useState(new Map<string, string>());

  useEffect(() => {
    if (rtcConnectionManager == null) return;

    rtcConnectionManager.addEventListener(RTCEventType.Message, ({ message }) => {
      const id = crypto.randomUUID().toString();

      setErrors(prev => {
        const tmp = new Map(prev.entries());
        tmp.set(id, (message as SignalingError).message);
        return tmp;
      });

      setTimeout(() => {
        setErrors(prev => {
          const tmp = new Map(prev.entries());
          tmp.delete(id);
          return tmp;
        })
      }, 3000);
    }, { messageType: SignalingMessageType.Error })
  }, [rtcConnectionManager]);

  return (
    <div className="position-absolute start-50">
      {Array.from(errors.values()).map((error, index) =>
        <div key={`error${index}`} className="text-white bg-danger p-3 mt-3 border-rounded">{error}</div>
      )}
    </div>
  );
}
