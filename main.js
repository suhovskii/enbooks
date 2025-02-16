const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

let mainWindow;
const desktopPath = path.join(os.homedir(), "Desktop", "EnBooks");
const libraryPath = path.join(desktopPath, "library"); // Папка для книг
const csvFilePath = path.join(desktopPath, "translations.csv");

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

// Функция для сохранения книги
function saveBookToLibrary(filename, content) {
  const filePath = path.join(libraryPath, filename);
  fs.writeFile(filePath, content, (err) => {
    if (err) console.error("Ошибка при сохранении книги:", err);
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

  mainWindow.loadURL("http://localhost:3001");
}

ipcMain.on("save-translation", (event, word, translation) => {
  saveTranslationToCSV(word, translation);
});

// Обработчик для сохранения книги
ipcMain.on("save-book", (event, filename, content) => {
  saveBookToLibrary(filename, content);
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