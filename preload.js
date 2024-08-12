const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  startProcessing: (config) => ipcRenderer.invoke('start-processing', config),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
});