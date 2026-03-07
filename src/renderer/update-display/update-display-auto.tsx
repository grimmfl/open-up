export default function UpdateDisplayAuto({ onUpdate }: { onUpdate: () => void}) {
  function restartNow() {
    window.electron.ipcRenderer.sendMessage('install');
    onUpdate();
  }

  function restartLater() {
    window.electron.ipcRenderer.sendMessage('install-on-quit');
    onUpdate();
  }

  return (
    <div className="position-relative">
      <div className="blur">
      </div>
      <div className="update-dialog p-3 d-flex flex-column justify-content-between">
        <div className="mb-2 scrollable">
          <h5 className="text-center ">Update Available</h5>
          <div className="text-small mt-2">
            The update has been loaded in the background.<br/><br/>
            It is highly recommended, to install the update now.<br/>
            This requires restarting the application.<br/><br/>
            If you can't stop talking now, the update will be installed after you close the application.
          </div>
        </div>
        <div className="d-flex flex-row justify-content-between gap-2">
          <button className="btn flex-grow-1" onClick={restartNow}>Restart Now</button>
          <button className="btn flex-grow-1" onClick={restartLater}>Restart Later</button>
        </div>
      </div>
    </div>
  );
}
