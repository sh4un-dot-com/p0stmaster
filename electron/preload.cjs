const { contextBridge, ipcRenderer } = require('electron');

const VAULT_LOAD_CHANNEL = 'p0stmaster:vault-load';
const VAULT_SAVE_CHANNEL = 'p0stmaster:vault-save';
const VAULT_KEY_LOAD_CHANNEL = 'p0stmaster:vault-key-load';
const VAULT_KEY_SAVE_CHANNEL = 'p0stmaster:vault-key-save';

contextBridge.exposeInMainWorld('p0stmasterVault', {
  backend: 'file',
  load: () => ipcRenderer.invoke(VAULT_LOAD_CHANNEL),
  save: (encryptedPayload) => ipcRenderer.invoke(VAULT_SAVE_CHANNEL, encryptedPayload),
  loadKey: () => ipcRenderer.invoke(VAULT_KEY_LOAD_CHANNEL),
  saveKey: (vaultKey) => ipcRenderer.invoke(VAULT_KEY_SAVE_CHANNEL, vaultKey),
});
