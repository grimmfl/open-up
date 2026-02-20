import {useContext} from "react";
import {UserContext, UserInfoSettingsContext} from "../../contexts";

export default function UserInfoSettings() {
  const { setUserName } = useContext(UserContext);

  const { userNameInput, setUserNameInput } = useContext(UserInfoSettingsContext);

  function getIsSaveDisabled() {
    if (userNameInput.trim().length === 0) {
      return true;
    }

    return false;
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
    </div>
  )
}
