import React from "react";

function TranslationPanel({ translations }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "10px",
        borderLeft: "1px solid #ddd",
        overflowY: "auto",
        minWidth: "180px",  // Минимальная ширина 6 см (приблизительно 180px)
        resize: "horizontal",  // Позволяет изменять ширину панели
        overflow: "auto",
        position: "relative",
      }}
    >
      <h3>Переводы</h3>
      {translations.map((item, index) => (
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
