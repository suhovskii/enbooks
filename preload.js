const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  saveTranslation: (word, translation) => ipcRenderer.send("save-translation", word, translation),
});
