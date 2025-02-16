import React from "react";

function TranslationPanel({ translations, bgColor, isDarkMode }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "150px",
        right: "0",
        width: "300px",
        height: "calc(100vh - 160px)",
        overflowY: "auto",
        borderLeft: "1px solid #ddd",
        padding: "10px",
        backgroundColor: isDarkMode ? "#2D2D2D" : bgColor,
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>Переводы</h3>
      {translations.slice(0, 15).map((item, index) => (
        <div key={index}>
          <p style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
            <strong>{item.word}</strong>: {item.translation}
          </p>
        </div>
      ))}
    </div>
  );
}

export default TranslationPanel;