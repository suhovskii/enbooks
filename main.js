const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

let mainWindow;
const desktopPath = path.join(os.homedir(), "Desktop", "EnBooks");
const libraryPath = path.join(desktopPath, "library");
const csvFilePath = path.join(desktopPath, "translations.csv");
const lastChunkIndexPath = path.join(desktopPath, "lastChunkIndex.json"); // Файл для хранения последнего блока

if (!fs.existsSync(desktopPath)) {
  fs.mkdirSync(desktopPath, { recursive: true });
}
if (!fs.existsSync(libraryPath)) {
  fs.mkdirSync(libraryPath, { recursive: true });
}

function saveTranslationToCSV(word, translation) {
  const row = `"${word}","${translation}"\n`;
  fs.appendFile(csvFilePath, row, (err) => {
    if (err) console.error("Ошибка при сохранении в CSV:", err);
  });
}

function saveBookToLibrary(filename, content) {
  const filePath = path.join(libraryPath, filename);
  fs.writeFile(filePath, content, (err) => {
    if (err) console.error("Ошибка при сохранении книги:", err);
  });
}

// Сохранение последнего просмотренного блока
function saveLastChunkIndex(index) {
  fs.writeFile(lastChunkIndexPath, JSON.stringify({ index }), (err) => {
    if (err) console.error("Ошибка при сохранении последнего блока:", err);
  });
}

// Загрузка последнего просмотренного блока
function getLastChunkIndex() {
  return new Promise((resolve) => {
    fs.readFile(lastChunkIndexPath, "utf8", (err, data) => {
      if (err) {
        resolve(undefined); // Файл не существует
      } else {
        try {
          const { index } = JSON.parse(data);
          resolve(index);
        } catch (e) {
          resolve(undefined);
        }
      }
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
}

ipcMain.on("save-translation", (event, word, translation) => {
  saveTranslationToCSV(word, translation);
});

ipcMain.on("save-book", (event, filename, content) => {
  saveBookToLibrary(filename, content);
});

// Обработчики для работы с последним блоком
ipcMain.handle("get-last-chunk-index", async () => {
  return await getLastChunkIndex();
});

ipcMain.on("save-last-chunk-index", (event, index) => {
  saveLastChunkIndex(index);
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});