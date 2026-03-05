import {GITHUB_REPO} from "../../shared/static";

export function UpdateDisplayManual() {
  const extension = 'dmg';

  return (
    <div className="text-center">
      Update Available!
      {window.platform === 'darwin' &&
        <a href={`${GITHUB_REPO}/releases/latest/download/OpenUp.${extension}`} className="mx-1">Download here</a>
      }
    </div>
  );
}
