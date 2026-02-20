import {useContext, useRef, useState} from "react";
import {RoomContext} from "../../contexts";

export default function CopyRoomButton() {
  const {roomCode} = useContext(RoomContext);

  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipRef = useRef<HTMLDivElement | null>(null);

  function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then();
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 1000);
  }

  return (
    <div>
      <button className="btn btn-disabled mt-4 mb-2 w-100" onClick={copyRoomCode}>{roomCode}</button>
      {
        showTooltip && (
          <div ref={tooltipRef} className="position-fixed bg-darker border-rounded py-2 px-6">
            Copied!
          </div>
        )
      }
    </div>
  );
}
