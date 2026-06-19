import {GITHUB_REPO} from "../../shared/static";

export function UpdateDisplayManual() {
  const extension = 'dmg';

  return (
    <div className="text-center">
      Update Available!<br/>
      Download the latest version
      {window.platform === 'darwin' &&
        <a href={`${GITHUB_REPO}/releases/latest/download/OpenUp.${extension}`} className="mx-1">here</a>
      }
      to keep using OpenUp.
    </div>
  );
}
