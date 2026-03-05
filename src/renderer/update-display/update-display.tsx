import {UpdateDisplayManual} from "./update-display-manual";
import {useState} from "react";

export default function UpdateDisplay() {
  const [isManualUpdate, setIsManualUpdate] = useState(false);

  window.electron.ipcRenderer.on('manual-update', () => {
    setIsManualUpdate(true);
  });

  return (isManualUpdate &&
    <div className="bg-infos p-2">
      <UpdateDisplayManual/>
    </div>
  );
}
