import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectRarFile: () => ipcRenderer.invoke('dialog:openRar'),
  selectFolder: () => ipcRenderer.invoke('dialog:openFolder'),
});
