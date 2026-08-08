import { app, BrowserWindow, Menu, ipcMain, shell, safeStorage } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer } from '../serve.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let serverHandle = null;

const EXTERNAL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const ABOUT_EVENT = 'p0stmaster:open-about';
const VAULT_FILENAME = 'vault.json';
const VAULT_KEY_FILENAME = 'vault.key';
const VAULT_LOAD_CHANNEL = 'p0stmaster:vault-load';
const VAULT_SAVE_CHANNEL = 'p0stmaster:vault-save';
const VAULT_KEY_LOAD_CHANNEL = 'p0stmaster:vault-key-load';
const VAULT_KEY_SAVE_CHANNEL = 'p0stmaster:vault-key-save';

const getVaultFilePath = () => path.join(app.getPath('userData'), VAULT_FILENAME);
const getVaultKeyFilePath = () => path.join(app.getPath('userData'), VAULT_KEY_FILENAME);

const isNonEmptyString = (value) => typeof value === 'string' && Boolean(value.trim());

const registerVaultHandlers = () => {
  ipcMain.handle(VAULT_LOAD_CHANNEL, async () => {
    try {
      return await fs.readFile(getVaultFilePath(), 'utf8');
    } catch (error) {
      if (error && typeof error === 'object' && error.code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  });

  ipcMain.handle(VAULT_SAVE_CHANNEL, async (_event, encryptedPayload) => {
    if (!isNonEmptyString(encryptedPayload)) {
      throw new Error('Vault payload must be a non-empty string');
    }

    await fs.writeFile(getVaultFilePath(), encryptedPayload, 'utf8');
    return true;
  });

  ipcMain.handle(VAULT_KEY_LOAD_CHANNEL, async () => {
    try {
      const storedValue = await fs.readFile(getVaultKeyFilePath());

      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(storedValue);
      }

      return storedValue.toString('utf8');
    } catch (error) {
      if (error && typeof error === 'object' && error.code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  });

  ipcMain.handle(VAULT_KEY_SAVE_CHANNEL, async (_event, vaultKey) => {
    if (!isNonEmptyString(vaultKey)) {
      throw new Error('Vault key must be a non-empty string');
    }

    const payload = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(vaultKey)
      : Buffer.from(vaultKey, 'utf8');

    await fs.writeFile(getVaultKeyFilePath(), payload);
    return true;
  });
};

const openExternalUrl = async (targetUrl) => {
  try {
    const parsedUrl = new URL(targetUrl);
    if (!EXTERNAL_PROTOCOLS.has(parsedUrl.protocol)) {
      return false;
    }

    await shell.openExternal(parsedUrl.toString());
    return true;
  } catch {
    return false;
  }
};

const dispatchRendererEvent = async (eventName, targetWindow = BrowserWindow.getFocusedWindow() || mainWindow) => {
  if (!targetWindow || targetWindow.isDestroyed()) {
    return false;
  }

  const sendEvent = () => targetWindow.webContents.executeJavaScript(
    `window.dispatchEvent(new CustomEvent(${JSON.stringify(eventName)}));`,
    true,
  );

  if (targetWindow.webContents.isLoadingMainFrame()) {
    targetWindow.webContents.once('did-finish-load', () => {
      void sendEvent();
    });
    return true;
  }

  await sendEvent();
  return true;
};

const buildApplicationMenu = () => {
  const template = [];

  if (process.platform === 'darwin') {
    template.push({
      label: app.name,
      submenu: [
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  } else {
    template.push({
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    });
  }

  template.push(
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: process.platform === 'darwin'
        ? [
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' },
          ]
        : [
            { role: 'minimize' },
            { role: 'close' },
          ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About p0stmaster',
          click: () => {
            void dispatchRendererEvent(ABOUT_EVENT);
          },
        },
        { type: 'separator' },
        {
          label: 'Akita Engineering Website',
          click: () => {
            void openExternalUrl('https://www.akitaengineering.com');
          },
        },
        {
          label: 'Email Support',
          click: () => {
            void openExternalUrl('mailto:support@akitaengineering.com');
          },
        },
      ],
    },
  );

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const createWindow = async () => {
  const rootDir = path.resolve(__dirname, '..');
  serverHandle = await startServer({ port: 0, rootDir, silent: true });
  const appOrigin = new URL(serverHandle.url).origin;

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
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  buildApplicationMenu();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void openExternalUrl(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    try {
      const parsedUrl = new URL(targetUrl);
      if (parsedUrl.origin === appOrigin) {
        return;
      }
    } catch {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    void openExternalUrl(targetUrl);
  });

  await mainWindow.loadURL(serverHandle.url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(async () => {
  registerVaultHandlers();
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
