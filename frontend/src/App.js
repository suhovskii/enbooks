import React, { useState } from "react";
import TextInput from "./components/TextInput";
import TranslationPanel from "./components/TranslationPanel";
import Modal from "react-modal";

// Пример использования Google Translate API
const fetchTranslation = async (word) => {
  const response = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|ru`);
  const data = await response.json();
  return data.responseData.translatedText;
};

function App() {
  const [translations, setTranslations] = useState([]);  // Массив для переведённых слов
  const [text, setText] = useState("");  // Текст для чтения
  const [isModalOpen, setIsModalOpen] = useState(false);  // Состояние модального окна для ввода текста

  const handleWordClick = async (word) => {
    const translation = await fetchTranslation(word);  // Получаем перевод
    setTranslations((prev) => {
      const newTranslations = [...prev];
      newTranslations.unshift({ word, translation });  // Добавляем новое слово в начало
      if (newTranslations.length > 5) newTranslations.pop();  // Оставляем только 5 последних
      return newTranslations;
    });
  };

  const openTextInputModal = () => {
    setIsModalOpen(true);  // Открытие модального окна
  };

  const closeTextInputModal = () => {
    setIsModalOpen(false);  // Закрытие модального окна
  };

  const handleTextSubmit = () => {
    closeTextInputModal();  // Закрыть модальное окно после ввода текста
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "10px" }}>
      <button
        onClick={openTextInputModal}
        style={{
          marginBottom: "20px",
          alignSelf: "flex-start",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Ввести текст
      </button>

      <div style={{ display: "flex", flex: 1, flexDirection: "row", justifyContent: "space-between", height: "calc(100% - 60px)" }}>
        <TextInput text={text} setText={setText} onWordClick={handleWordClick} />
        <TranslationPanel translations={translations} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeTextInputModal}
        contentLabel="Введите текст"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: { width: "300px", height: "200px", margin: "auto", padding: "20px" },
        }}
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

export default App;
