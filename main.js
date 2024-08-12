const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const createFolder = require('./utils/createFolder');
const dispatchWorker = require('./utils/dispatchWorker');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 570,
    height: 730,
    resizable: false, // Désactiver le redimensionnement
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  // Ajuster la taille de la fenêtre à la taille du contenu
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const { width, height } = document.documentElement.getBoundingClientRect();
      require('electron').remote.getCurrentWindow().setContentSize(Math.ceil(width), Math.ceil(height));
    `);
  });
}

app.on('ready', () => {
  // Register IPC handlers
  ipcMain.handle('start-processing', async (event, config) => {
    // Add accepted formats directly in the code
    config.acceptedFormats = ["jpeg", "jpg", "webp", "png", "tiff"];
    
    try {
      createFolder(config);
      await dispatchWorker(config);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (result.canceled) {
      return null;
    } else {
      return result.filePaths[0];
    }
  });

  // Create the main window
  createWindow();
});