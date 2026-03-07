/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {app, BrowserWindow, shell, ipcMain, nativeTheme} from 'electron';
import {autoUpdater} from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {resolveHtmlPath} from './util';
import {load, save} from "./persistence";
import dotenv from 'dotenv';

class AppUpdater {
  constructor() {
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('load-data', async (event) => {
  const data = load();

  if (data?.darkMode != null) {
    nativeTheme.themeSource = data.darkMode ? 'dark' : 'light';
  }

  if (data != null && data?.darkMode == null) {
    data.darkMode = nativeTheme.shouldUseDarkColors;
  }

  event.reply('load-data', data);
});

ipcMain.on('save-data', async (_, data) => {
  save(data, data => {
    if (data.darkMode != null) {
      nativeTheme.themeSource = data.darkMode ? 'dark' : 'light';
    }
  });
});

ipcMain.on('install-on-quit', async () => {
  autoUpdater.autoInstallOnAppQuit = true;
});

ipcMain.on('install', async () => {
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.on('open-link', async (_, data) => {
  await shell.openExternal(data);
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    autoHideMenuBar: true
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return {action: 'deny'};
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const checkForAutoUpdates = async () => {
  log.transports.file.level = 'info';
  autoUpdater.logger = log;

  autoUpdater.on('update-available', () => {
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('auto-update');
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
  });

  autoUpdater.checkForUpdates();
}

const checkForManualUpdates = async () => {
  const response = await fetch(
    'https://api.github.com/repos/grimmfl/open-up/releases/latest'
  );
  const release = await response.json();

  const latestVersion = release.tag_name.replace('v', '');
  const currentVersion = app.getVersion();

  if (latestVersion !== currentVersion) {
    mainWindow?.webContents.send('manual-update');
  }
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    const envPath = app.isPackaged
      ? path.join(process.resourcesPath, '.env')
      : path.join(__dirname, '../.env');
    dotenv.config({path: envPath});

    createWindow().then(() => {
      mainWindow?.webContents.on('did-finish-load', () => {
        mainWindow?.webContents.send('version', app.getVersion());

        if (process.platform === 'win32') {
          checkForAutoUpdates();
        } else {
          checkForManualUpdates();
        }
      });
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });

  })
  .catch(console.log);
