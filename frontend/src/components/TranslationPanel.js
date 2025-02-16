import React from "react";

function TranslationPanel({ translations, bgColor }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        right: "0",
        width: "300px",
        maxHeight: "calc(100vh - 60px)",
        overflowY: "auto",
        borderLeft: "1px solid #ddd",
        padding: "10px",
        backgroundColor: bgColor,
      }}
    >
      <h3>Переводы</h3>
      {translations.slice(0, 15).map((item, index) => (
        <div key={index}>
          <p>
            <strong>{item.word}</strong>: {item.translation}
          </p>
        </div>
      ))}
    </div>
  );
}

export default TranslationPanel;