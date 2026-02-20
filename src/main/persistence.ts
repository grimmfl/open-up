import {app} from "electron";
import fs from "fs";
import path from "path";
import {PersistenceData, validateData} from "../shared/data";

const fileName = 'settings.json';

export function save(input: any) {
  const data = validateData(input);

  if (data == null) return;

  const dirPath = getDataPath();

  const filePath = path.join(dirPath, fileName);

  fs.writeFileSync(filePath, JSON.stringify(data));
}

export function load(): PersistenceData | null {
  const dirPath = getDataPath();

  const filePath = path.join(dirPath, fileName);

  if (!fs.existsSync(filePath)) return null;

  const content = JSON.parse(fs.readFileSync(filePath).toString());

  return validateData(content);
}

function getDataPath() {
  let dirPath;

  switch (process.platform) {
    case 'darwin':
      dirPath = process.env.HOME;
      break;
    case 'win32':
      dirPath = process.env.APPDATA;
      break;
    default:
      return app.getPath('userData');
  }

  dirPath = path.join(dirPath!, 'OpenUp');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  return dirPath;
}
