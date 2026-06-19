import {useContext, useEffect, useRef, useState} from "react";
import {PeerSettingsContext, RoomContext} from "../../contexts";
import {alterMapState} from "../../../shared/utils";

export default function PeersDisplay() {
  const {peerNames} = useContext(RoomContext);
  const {setPeers} = useContext(PeerSettingsContext);

  const [peerMenu, setPeerMenu] = useState<string | null>(null);

  const [peerVolume, setPeerVolume] = useState(100);

  const peerMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.addEventListener('mousedown', evt => {
      const menu = peerMenuRef.current as HTMLDivElement;

      if (menu == null) return;

      if (menu && !menu.contains(evt.target as Node)) setPeerMenu(null);
    })
  }, []);

  function openPeerMenu(peerId: string): void {
    setPeerMenu(peerId);
  }

  function setVolume(volume: number) {
    if (peerMenu == null) return;

    setPeerVolume(volume);
    setPeers(prev => alterMapState(prev, m => {
      const data = m.get(peerMenu);

      m.set(peerMenu, { ...data, clientId: peerMenu, volume: volume })
    }))
  }

  return (
    <table className="table">
      <tbody>
      {Array.from(peerNames.entries()).map(([peerId, peerName], index) =>
        <tr key={`peer${index}`}>
          <td onClick={() => openPeerMenu(peerId)}>
            {peerName}
            {peerId == peerMenu &&
              <div className="peer-menu d-flex flex-column" ref={peerMenuRef}>
                <div className="p-2">
                  <input type="range" min={0} max={100} className="custom-range mx-2" value={peerVolume} onChange={e => setVolume(e.target.valueAsNumber)}></input>
                  { peerVolume }%
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
