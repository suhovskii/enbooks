import React, { useState } from "react";

function TextInput({ text, setText, onWordClick }) {

  const handleWordClick = (word) => {
    if (onWordClick) {
      onWordClick(word);  // Отправляем слово в родительский компонент
    }
  };

  // Функция для преобразования текста в элементы с кликабельными словами
  const processText = (text) => {
    const words = text.split(" ");
    return words.map((word, index) => (
      <span
        key={index}
        style={{
          cursor: "pointer",
          color: "blue",
          userSelect: "none",  // Убираем постоянное выделение текста
        }}
        onClick={() => handleWordClick(word)}
      >
        {word}{" "}
      </span>
    ));
  };

  return (
    <div style={{ flex: 2, padding: 10, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, marginBottom: "10px" }}>
        {processText(text)}
      </div>
    </div>
  );
}

export default TextInput;
