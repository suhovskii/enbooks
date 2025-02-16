import React from "react";

const buttonStyle = {
  padding: "8px 16px",
  fontSize: "16px",
  cursor: "pointer",
  border: "1px solid #ccc",
  borderRadius: "5px",
  backgroundColor: "#f0f0f0",
  transition: "background-color 0.3s, transform 0.2s",
};

function RepeatMode({ repeatWords, handleTranslationChoice, bgColor, isDarkMode }) {
  return (
    <div style={{ flex: 2, padding: 10, overflowY: "auto", marginRight: "300px", backgroundColor: isDarkMode ? "#2D2D2D" : bgColor, borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
      <h3 style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>Режим повтора</h3>
      {repeatWords.map((word, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <p style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>{word.word}</p>
          {[word.correctTranslation, ...word.incorrectTranslations].sort(() => Math.random() - 0.5).map((translation, i) => (
            <button
              key={i}
              onClick={() => handleTranslationChoice(word.word, translation, word.correctTranslation)}
              style={{ ...buttonStyle, marginRight: "10px" }}
            >
              {translation}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default RepeatMode;