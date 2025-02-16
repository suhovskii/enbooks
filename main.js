const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

let mainWindow;
const desktopPath = path.join(os.homedir(), "Desktop", "EnBooks");
const csvFilePath = path.join(desktopPath, "translations.csv");

// Создаём папку, если её нет
if (!fs.existsSync(desktopPath)) {
  fs.mkdirSync(desktopPath, { recursive: true });
}

// Функция записи в CSV
function saveTranslationToCSV(word, translation) {
  const row = `"${word}","${translation}"\n`;
  fs.appendFile(csvFilePath, row, (err) => {
    if (err) console.error("Ошибка при сохранении в CSV:", err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
}

// Обработчик получения перевода из рендерера
ipcMain.on("save-translation", (event, word, translation) => {
  saveTranslationToCSV(word, translation);
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
