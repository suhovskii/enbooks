const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  saveTranslation: (word, translation) => ipcRenderer.send("save-translation", word, translation),
  saveBook: (filename, content) => ipcRenderer.send("save-book", filename, content),
  getLastChunkIndex: () => ipcRenderer.invoke("get-last-chunk-index"),
  saveLastChunkIndex: (index) => ipcRenderer.send("save-last-chunk-index", index),
});