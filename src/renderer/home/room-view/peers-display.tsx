import {useContext, useState} from "react";
import {RoomContext} from "../../contexts";

export default function PeersDisplay() {
  const {peerNames} = useContext(RoomContext);

  const [peerMenu, setPeerMenu] = useState<string | null>(null);

  function openPeerMenu(peerId: string): void {
    setPeerMenu(peerId);
  }

  return (
    <table className="table">
      <tbody>
      {Array.from(peerNames.values()).map((peer, index) =>
        <tr key={`peer${index}`}>
          <td onClick={() => openPeerMenu(peer)}>
            {peer}
            {peer == peerMenu &&
              <div className="peer-menu d-flex flex-column">
                <div className="p-2">
                  <input type="range" className="custom-range mx-2"></input>
                  100%
                </div>
              </div>
            }
          </td>
        </tr>
      )}
      </tbody>
    </table>
  );
}
