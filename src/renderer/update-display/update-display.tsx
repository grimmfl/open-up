import {UpdateDisplayManual} from "./update-display-manual";
import {ReactElement, ReactNode, useState} from "react";
import UpdateDisplayAuto from "./update-display-auto";

export default function UpdateDisplay({ children }: { children: ReactElement }) {
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  const [isAutoUpdate, setIsAutoUpdate] = useState(false);

  window.electron.ipcRenderer.on('manual-update', () => {
    setIsManualUpdate(true);
  });

  window.electron.ipcRenderer.on('auto-update', () => {
    setIsAutoUpdate(true);
  })

  function onUpdate(): void {
    setIsManualUpdate(false);
    setIsAutoUpdate(false);
  }

  return !(isManualUpdate || isAutoUpdate)
    ? <div className="d-flex justify-content-center align-items-center vh-100">
      {
        isManualUpdate
        ? <UpdateDisplayManual/>
          : <UpdateDisplayAuto onUpdate={onUpdate} />
      }
    </div>
    : <div>{children}</div>;
}
