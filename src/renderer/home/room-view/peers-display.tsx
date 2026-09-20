import { useContext, useEffect, useRef, useState } from 'react';
import {
  DeviceContext,
  PeerSettingsContext,
  RoomContext,
  UserContext,
} from '../../contexts';
import { alterMapState } from '../../../shared/utils';
import CircleIcon from '../../icons/circle-icon';

const TalkingThreshold = 15;

export default function PeersDisplay() {
  const { peerNames, peerVolumes } = useContext(RoomContext);
  const { userName, clientId } = useContext(UserContext);
  const { setPeers } = useContext(PeerSettingsContext);
  const { inputThreshold } = useContext(DeviceContext);

  const [peerMenu, setPeerMenu] = useState<string | null>(null);

  const [peerVolume, setPeerVolume] = useState(100);

  const peerMenuRef = useRef<HTMLDivElement | null>(null);

  const peers = Array.from(peerNames.entries())
    .concat([[clientId ?? '', userName]])
    .sort(([_, a], [__, b]) => a.localeCompare(b));

  useEffect(() => {
    document.addEventListener('mousedown', (evt) => {
      const menu = peerMenuRef.current as HTMLDivElement;

      if (menu == null) return;

      if (menu && !menu.contains(evt.target as Node)) setPeerMenu(null);
    });
  }, []);

  function openPeerMenu(peerId: string): void {
    setPeerMenu(peerId);
  }

  function setVolume(volume: number) {
    if (peerMenu == null) return;

    setPeerVolume(volume);
    setPeers((prev) =>
      alterMapState(prev, (m) => {
        const data = m.get(peerMenu);

        m.set(peerMenu, { ...data, clientId: peerMenu, volume: volume });
      }),
    );
  }

  function isTalking(peer: string): boolean {
    const volume = peerVolumes.get(peer) ?? 0;

    return volume >= (peer === clientId ? inputThreshold : TalkingThreshold);
  }

  return (
    <table className="table">
      <tbody>
        {peers.map(([peerId, peerName], index) => (
          <tr key={`peer${index}`}>
            <td
              className="d-flex align-items-center"
              onClick={() => openPeerMenu(peerId)}
            >
              <div
                className="d-flex align-items-center"
                style={{ width: '16px' }}
              >
                {isTalking(peerId) && <CircleIcon width={16} height={16} />}
              </div>
              <div className="ms-2">{peerName}</div>
              {peerId == peerMenu && (
                <div className="peer-menu d-flex flex-column" ref={peerMenuRef}>
                  <div className="p-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      className="custom-range mx-2"
                      value={peerVolume}
                      onChange={(e) => setVolume(e.target.valueAsNumber)}
                    ></input>
                    {peerVolume}%
                  </div>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
