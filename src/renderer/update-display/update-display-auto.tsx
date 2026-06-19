import {GITHUB_REPO} from "../../shared/static";
import {useEffect, useState} from "react";

export default function UpdateDisplayAuto({ onUpdate }: { onUpdate: () => void}) {
  function restartNow() {
    window.electron.ipcRenderer.sendMessage('install');
    onUpdate();
  }

  function restartLater() {
    window.electron.ipcRenderer.sendMessage('install-on-quit');
    onUpdate();
  }

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.electron.ipcRenderer.on('auto-update-progress', (p: any) => {
      setProgress(p);
    });
  }, []);

  return (
    <div className="text-center">
      Downloading Update<br/>
      <div className="progress mt-3" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar bg-primaryy" style={ {width: `${progress}%`}}></div>
      </div>
    </div>
  );
}
