import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ReadingMode from "./components/ReadingMode";
import RepeatMode from "./components/RepeatMode";
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
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [repeatWords, setRepeatWords] = useState([]);
  const [score, setScore] = useState(0);
  const [notification, setNotification] = useState(null);

  // Загрузка последнего просмотренного блока и счётчика очков из лога
  useEffect(() => {
    if (window.electron && window.electron.getLastChunkIndex) {
      window.electron.getLastChunkIndex().then((index) => {
        if (index !== undefined) {
          setCurrentChunkIndex(index);
        }
      });
    }
    if (window.electron && window.electron.getScore) {
      window.electron.getScore().then((savedScore) => {
        if (savedScore !== undefined) {
          setScore(savedScore);
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

  // Загрузка слов для режима повтора
  useEffect(() => {
    if (isRepeatMode) {
      loadRepeatWords();
    }
  }, [isRepeatMode]);

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

  // Загрузка слов для режима повтора
  const loadRepeatWords = () => {
    const words = translations
      .filter((item) => !item.lastShown || Date.now() - item.lastShown > 86400000) // Фильтр по времени
      .slice(0, 10)
      .map((item) => ({
        word: item.word,
        correctTranslation: item.translation,
        incorrectTranslations: getRandomTranslations(item.translation),
        correctCount: item.correctCount || 0,
      }));
    setRepeatWords(words);
  };

  // Получение случайных переводов для неверных вариантов
  const getRandomTranslations = (correctTranslation) => {
    const randomWords = translations
      .filter((item) => item.translation !== correctTranslation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((item) => item.translation);
    return randomWords;
  };

  // Обработчик выбора перевода в режиме повтора
  const handleTranslationChoice = (word, chosenTranslation, correctTranslation) => {
    const isCorrect = chosenTranslation === correctTranslation;
    setNotification(isCorrect ? "Правильно! +1 очко" : "Неправильно! -1 очко");

    setTimeout(() => {
      setNotification(null);
    }, 2000);

    const updatedWords = repeatWords.filter((w) => w.word !== word);
    setRepeatWords(updatedWords);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (window.electron && window.electron.saveScore) {
        window.electron.saveScore(score + 1);
      }
      const updatedTranslations = translations.map((t) =>
        t.word === word ? { ...t, correctCount: (t.correctCount || 0) + 1, lastShown: Date.now() } : t
      );
      setTranslations(updatedTranslations);
    } else {
      setScore((prev) => prev - 1);
      if (window.electron && window.electron.saveScore) {
        window.electron.saveScore(score - 1);
      }
    }

    if (updatedWords.length === 0) {
      loadRepeatWords();
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "10px", backgroundColor: bgColor }}>
      {/* Верхний ряд кнопок */}
      <Header
        openTextInputModal={openTextInputModal}
        decreaseFontSize={decreaseFontSize}
        increaseFontSize={increaseFontSize}
        fontSize={fontSize}
        bgColor={bgColor}
        setBgColor={setBgColor}
        handleFileUpload={handleFileUpload}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isRepeatMode={isRepeatMode}
        setIsRepeatMode={setIsRepeatMode}
        score={score}
        getCurrentPercentage={getCurrentPercentage}
        goToPercentage={goToPercentage}
        goToChunk={goToChunk}
        currentChunkIndex={currentChunkIndex}
        chunks={chunks}
      />

      {/* Уведомление */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: notification.includes("Правильно") ? "#4CAF50" : "#F44336",
            color: "#FFFFFF",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 1000,
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          }}
        >
          {notification}
        </div>
      )}

      {/* Основной контент */}
      <div style={{ marginTop: "150px", flex: 1, display: "flex", flexDirection: "row", height: "calc(100% - 60px)" }}>
        {isRepeatMode ? (
          <RepeatMode
            repeatWords={repeatWords}
            handleTranslationChoice={handleTranslationChoice}
            bgColor={bgColor}
            isDarkMode={isDarkMode}
          />
        ) : (
          <ReadingMode
            text={text}
            setText={setText}
            handleWordClick={handleWordClick}
            fontSize={fontSize}
            isDarkMode={isDarkMode}
            bgColor={bgColor}
          />
        )}
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

const modalStyle = {
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  content: { width: "300px", height: "200px", margin: "auto", padding: "20px", borderRadius: "10px" },
};

export default App;