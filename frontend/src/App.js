import React, { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
  const [currentChunk, setCurrentChunk] = useState(0); // Текущий фрагмент текста
  const [fullText, setFullText] = useState(""); // Полный текст книги

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
      setIsLoading(true); // Начало загрузки
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        setFullText(text); // Сохраняем весь текст
        setText(text.slice(0, 50000)); // Отображаем первые 50 000 символов
        setCurrentChunk(0); // Сбрасываем текущий фрагмент
        setIsLoading(false); // Загрузка завершена

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

  // Функция для загрузки следующего фрагмента текста
  const loadNextChunk = () => {
    const nextChunk = currentChunk + 1;
    const start = nextChunk * 50000;
    const end = start + 50000;
    setText(fullText.slice(0, end)); // Добавляем следующий фрагмент
    setCurrentChunk(nextChunk);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "10px", backgroundColor: bgColor }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <button onClick={openTextInputModal} style={buttonStyle}>Ввести текст</button>
        <button onClick={decreaseFontSize} style={buttonStyle}>−</button>
        <span style={{ fontSize: "18px" }}>{fontSize}px</span>
        <button onClick={increaseFontSize} style={buttonStyle}>+</button>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          style={{ width: "40px", height: "30px", border: "none", cursor: "pointer" }}
        />
        {/* Кнопка для загрузки файла */}
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
      </div>

      {/* Индикатор загрузки */}
      {isLoading && <div style={{ marginBottom: "10px" }}>Загрузка...</div>}

      <div style={{ display: "flex", flex: 1, flexDirection: "row", height: "calc(100% - 60px)" }}>
        <div style={{ flex: 2, padding: 10, overflowY: "auto", marginRight: "300px" }}>
          <TextInput text={text} setText={setText} onWordClick={handleWordClick} fontSize={fontSize} />
          {/* Кнопка для загрузки следующего фрагмента */}
          {fullText.length > text.length && (
            <button onClick={loadNextChunk} style={buttonStyle}>
              Загрузить ещё
            </button>
          )}
        </div>
        <TranslationPanel translations={translations} bgColor={bgColor} />
      </div>

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
};

const modalStyle = {
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  content: { width: "300px", height: "200px", margin: "auto", padding: "20px" },
};

export default App;