import {useContext} from "react";
import {UserContext, UserInfoSettingsContext} from "../../contexts";

export default function UserInfoSettings() {
  const { setUserName } = useContext(UserContext);

  const { userNameInput, setUserNameInput, darkMode, setDarkMode } = useContext(UserInfoSettingsContext);

  function getIsSaveDisabled() {
    return userNameInput.trim().length === 0;
  }

  function save() {
    setUserName(userNameInput.trim());
  }

  return (
    <div>
      <div>
        <label htmlFor="userNameInput">Username</label>
        <input className="form-control mt-1" id="userNameInput" value={userNameInput} onChange={(e) => setUserNameInput(e.target.value)}/>
      </div>

      <button className="btn mt-2 w-100" disabled={getIsSaveDisabled()} onClick={save}>Save</button>

      <div className="form-check form-switch mt-2">
        <input className="form-check-input switch" type="checkbox" role="switch" id="darkModeSwitch" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)}/>
        <label className="form-check-label" htmlFor="darkModeSwitch">Dark Mode</label>
      </div>
    </div>
  )
}
