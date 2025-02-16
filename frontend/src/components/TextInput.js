import React, { useState } from "react";

function TextInput({ text, setText, onWordClick, fontSize, isDarkMode }) {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [translationPosition, setTranslationPosition] = useState({ x: 0, y: 0 });

  const handleWordClick = async (word, event) => {
    const translation = await onWordClick(word);
    setHoveredWord(translation);
    setTranslationPosition({ x: event.clientX, y: event.clientY });
  };

  const processText = (text) => {
    return text.split(" ").map((word, index) => (
      <span
        key={index}
        style={{
          cursor: "pointer",
          color: isDarkMode ? "#FFFFFF" : "#000000",
          userSelect: "none",
          fontSize: `${fontSize}px`,
          lineHeight: "1.2",
        }}
        onClick={(e) => handleWordClick(word, e)}
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
      {hoveredWord && (
        <div
          style={{
            position: "absolute",
            left: translationPosition.x,
            top: translationPosition.y,
            backgroundColor: isDarkMode ? "#2D2D2D" : "#FFFFFF",
            color: isDarkMode ? "#FFFFFF" : "#000000",
            padding: "5px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          {hoveredWord}
        </div>
      )}
    </div>
  );
}

export default TextInput;