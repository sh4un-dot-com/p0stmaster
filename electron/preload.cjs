const { contextBridge, ipcRenderer } = require('electron');

const VAULT_LOAD_CHANNEL = 'p0stmaster:vault-load';
const VAULT_SAVE_CHANNEL = 'p0stmaster:vault-save';

contextBridge.exposeInMainWorld('p0stmasterVault', {
  backend: 'file',
  load: () => ipcRenderer.invoke(VAULT_LOAD_CHANNEL),
  save: (encryptedPayload) => ipcRenderer.invoke(VAULT_SAVE_CHANNEL, encryptedPayload),
});