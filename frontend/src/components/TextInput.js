import React from "react";

function TextInput({ text, setText, onWordClick, fontSize, isDarkMode }) {
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
        onClick={() => onWordClick(word)}
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