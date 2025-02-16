import React from "react";
import TextInput from "./TextInput";

function ReadingMode({ text, setText, handleWordClick, fontSize, isDarkMode, bgColor }) {
  return (
    <div style={{ flex: 2, padding: 10, overflowY: "auto", marginRight: "300px", backgroundColor: isDarkMode ? "#2D2D2D" : bgColor, borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
      <TextInput text={text} setText={setText} onWordClick={handleWordClick} fontSize={fontSize} isDarkMode={isDarkMode} />
    </div>
  );
}

export default ReadingMode;