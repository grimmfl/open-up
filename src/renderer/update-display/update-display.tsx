import {UpdateDisplayManual} from "./update-display-manual";
import {useState} from "react";
import UpdateDisplayAuto from "./update-display-auto";

export function UpdateDisplay() {
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  const [isAutoUpdate, setIsAutoUpdate] = useState(false);

  window.electron.ipcRenderer.on('manual-update', () => {
    setIsManualUpdate(true);
  });

  window.electron.ipcRenderer.on('auto-update', () => {
    setIsAutoUpdate(true);
  })

  return ((isManualUpdate || isAutoUpdate) &&
    (isManualUpdate ? <UpdateDisplayManual/> : <UpdateDisplayAuto/>)
  );
}
