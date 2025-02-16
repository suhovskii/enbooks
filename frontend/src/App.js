import React, { useState, useEffect } from "react";
import TextInput from "./components/TextInput";
import TranslationPanel from "./components/TranslationPanel";
import Modal from "react-modal";

const fetchTranslation = async (word) => {
  const response = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|ru`);
  const data = await response.json();
  return data.responseData.translatedText;
};

function App() {
  const [translations, setTranslations] = useState([]);
  const [text, setText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [bgColor, setBgColor] = useState("#FFF8DC");
  const [isLoading, setIsLoading] = useState(false);
  const [fullText, setFullText] = useState("");
  const [chunks, setChunks] = useState([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Загрузка последнего просмотренного блока из лога
  useEffect(() => {
    if (window.electron && window.electron.getLastChunkIndex) {
      window.electron.getLastChunkIndex().then((index) => {
        if (index !== undefined) {
          setCurrentChunkIndex(index);
        }
      });
    }
  }, []);

  // Обновление текста при изменении текущего блока
  useEffect(() => {
    if (chunks.length > 0) {
      setText(chunks[currentChunkIndex]);
      if (window.electron && window.electron.saveLastChunkIndex) {
        window.electron.saveLastChunkIndex(currentChunkIndex);
      }
    }
  }, [currentChunkIndex, chunks]);

  // Переключение тёмной темы
  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#1E1E1E" : bgColor;
  }, [isDarkMode, bgColor]);

  const handleWordClick = async (word) => {
    const translation = await fetchTranslation(word);
    setTranslations((prev) => {
      const newTranslations = [{ word, translation }, ...prev];
      return newTranslations.slice(0, 15);
    });

    if (window.electron && window.electron.saveTranslation) {
      window.electron.saveTranslation(word, translation);
    }
  };

  const openTextInputModal = () => setIsModalOpen(true);
  const closeTextInputModal = () => setIsModalOpen(false);
  const handleTextSubmit = () => closeTextInputModal();

  const increaseFontSize = () => setFontSize((size) => Math.min(size + 2, 32));
  const decreaseFontSize = () => setFontSize((size) => Math.max(size - 2, 12));

  // Функция для загрузки файла
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        setFullText(text);

        // Разбиваем текст на блоки по 50 000 символов
        const chunkSize = 50000;
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
          chunks.push(text.slice(i, i + chunkSize));
        }
        setChunks(chunks);
        setCurrentChunkIndex(0);
        setIsLoading(false);

        // Сохраняем книгу в папку library
        if (window.electron && window.electron.saveBook) {
          await window.electron.saveBook(file.name, text);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Пожалуйста, загрузите файл в формате .txt");
    }
  };

  // Функция для перехода к другому блоку
  const goToChunk = (index) => {
    if (index >= 0 && index < chunks.length) {
      setCurrentChunkIndex(index);
    }
  };

  // Функция для перехода по проценту
  const goToPercentage = (percentage) => {
    const index = Math.floor((percentage / 100) * (chunks.length - 1));
    setCurrentChunkIndex(index);
  };

  // Вычисление текущего процента прочитанного
  const getCurrentPercentage = () => {
    return ((currentChunkIndex + 1) / chunks.length) * 100;
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "10px", backgroundColor: bgColor }}>
      {/* Верхний ряд кнопок */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, backgroundColor: isDarkMode ? "#2D2D2D" : bgColor, padding: "10px", zIndex: 1000, boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={openTextInputModal} style={buttonStyle}>Ввести текст</button>
          <button onClick={decreaseFontSize} style={buttonStyle}>−</button>
          <span style={{ fontSize: "18px", color: isDarkMode ? "#FFFFFF" : "#000000" }}>{fontSize}px</span>
          <button onClick={increaseFontSize} style={buttonStyle}>+</button>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{ width: "40px", height: "30px", border: "none", cursor: "pointer" }}
          />
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={buttonStyle}>
            Загрузить книгу
          </label>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={buttonStyle}>
            {isDarkMode ? "Светлая тема" : "Тёмная тема"}
          </button>
        </div>
        {/* Полоска прогресса */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <input
            type="range"
            min="0"
            max="100"
            value={getCurrentPercentage()}
            onChange={(e) => goToPercentage(e.target.value)}
            style={{ flex: 1, cursor: "pointer" }}
          />
          <span style={{ fontSize: "16px", color: isDarkMode ? "#FFFFFF" : "#000000" }}>{Math.round(getCurrentPercentage())}%</span>
        </div>
        {/* Кнопки перехода между блоками */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button onClick={() => goToChunk(currentChunkIndex - 3)} disabled={currentChunkIndex - 3 < 0} style={buttonStyle}>
            -3
          </button>
          <button onClick={() => goToChunk(currentChunkIndex - 2)} disabled={currentChunkIndex - 2 < 0} style={buttonStyle}>
            -2
          </button>
          <button onClick={() => goToChunk(currentChunkIndex - 1)} disabled={currentChunkIndex === 0} style={buttonStyle}>
            -1
          </button>
          <button onClick={() => goToChunk(currentChunkIndex + 1)} disabled={currentChunkIndex === chunks.length - 1} style={buttonStyle}>
            +1
          </button>
          <button onClick={() => goToChunk(currentChunkIndex + 2)} disabled={currentChunkIndex + 2 >= chunks.length} style={buttonStyle}>
            +2
          </button>
          <button onClick={() => goToChunk(currentChunkIndex + 3)} disabled={currentChunkIndex + 3 >= chunks.length} style={buttonStyle}>
            +3
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ marginTop: "150px", flex: 1, display: "flex", flexDirection: "row", height: "calc(100% - 60px)" }}>
        <div style={{ flex: 2, padding: 10, overflowY: "auto", marginRight: "300px", backgroundColor: isDarkMode ? "#2D2D2D" : bgColor, borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
          <TextInput text={text} setText={setText} onWordClick={handleWordClick} fontSize={fontSize} isDarkMode={isDarkMode} />
        </div>
        <TranslationPanel translations={translations} bgColor={bgColor} isDarkMode={isDarkMode} />
      </div>

      {/* Модальное окно для ввода текста */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeTextInputModal}
        contentLabel="Введите текст"
        style={modalStyle}
      >
        <h2>Введите текст</h2>
        <textarea
          style={{ width: "100%", height: "70px" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleTextSubmit}>Ввод</button>
      </Modal>
    </div>
  );
}

const buttonStyle = {
  padding: "8px 16px",
  fontSize: "16px",
  cursor: "pointer",
  border: "1px solid #ccc",
  borderRadius: "5px",
  backgroundColor: "#f0f0f0",
  transition: "background-color 0.3s, transform 0.2s",
};

const modalStyle = {
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  content: { width: "300px", height: "200px", margin: "auto", padding: "20px", borderRadius: "10px" },
};

export default App;