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
  const [bgColor, setBgColor] = useState("#FFF8DC"); // Тепло-желтый по умолчанию

  const handleWordClick = async (word) => {
    const translation = await fetchTranslation(word);
    setTranslations((prev) => {
      const newTranslations = [{ word, translation }, ...prev];
      return newTranslations.slice(0, 15); 
    });

    // Отправляем перевод в main процесс для сохранения в CSV
    if (window.electron && window.electron.saveTranslation) {
      window.electron.saveTranslation(word, translation);
    }
  };

  const openTextInputModal = () => setIsModalOpen(true);
  const closeTextInputModal = () => setIsModalOpen(false);
  const handleTextSubmit = () => closeTextInputModal();

  const increaseFontSize = () => setFontSize((size) => Math.min(size + 2, 32));
  const decreaseFontSize = () => setFontSize((size) => Math.max(size - 2, 12));

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "10px", backgroundColor: bgColor }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <button onClick={openTextInputModal} style={buttonStyle}>Ввести текст</button>
        <button onClick={decreaseFontSize} style={buttonStyle}>−</button>
        <span style={{ fontSize: "18px" }}>{fontSize}px</span>
        <button onClick={increaseFontSize} style={buttonStyle}>+</button>

        {/* Палитра выбора цвета фона */}
        <input 
          type="color" 
          value={bgColor} 
          onChange={(e) => setBgColor(e.target.value)} 
          style={{ width: "40px", height: "30px", border: "none", cursor: "pointer" }} 
        />
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "row", height: "calc(100% - 60px)" }}>
        <div style={{ flex: 2, padding: 10, overflowY: "auto", marginRight: "300px" }}>
          <TextInput text={text} setText={setText} onWordClick={handleWordClick} fontSize={fontSize} />
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
