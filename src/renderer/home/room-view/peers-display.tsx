import {useContext} from "react";
import {RoomContext} from "../../contexts";

export default function PeersDisplay() {
  const {peerNames} = useContext(RoomContext);

  return (
    <table className="table">
      <tbody>
      {Array.from(peerNames.values()).map((peer, index) =>
        <tr key={`peer${index}`}>
          <td>{peer}</td>
        </tr>
      )}
      </tbody>
    </table>
  );
}
