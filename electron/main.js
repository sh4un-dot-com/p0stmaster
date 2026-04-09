import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer } from '../serve.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let serverHandle = null;

const createWindow = async () => {
  const rootDir = path.resolve(__dirname, '..');
  serverHandle = await startServer({ port: 0, rootDir, silent: true });

  mainWindow = new BrowserWindow({
    width: 1520,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    autoHideMenuBar: true,
    backgroundColor: '#050816',
    title: 'p0stmaster',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  await mainWindow.loadURL(serverHandle.url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (serverHandle) {
    await serverHandle.close();
    serverHandle = null;
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  if (serverHandle) {
    await serverHandle.close();
    serverHandle = null;
  }
});