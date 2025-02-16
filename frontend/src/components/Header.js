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

function Header({
  openTextInputModal,
  decreaseFontSize,
  increaseFontSize,
  fontSize,
  bgColor,
  setBgColor,
  handleFileUpload,
  isDarkMode,
  setIsDarkMode,
  isRepeatMode,
  setIsRepeatMode,
  score,
  getCurrentPercentage,
  goToPercentage,
  goToChunk,
  currentChunkIndex,
  chunks,
}) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, backgroundColor: isDarkMode ? "#2D2D2D" : bgColor, padding: "10px", zIndex: 1000, boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={openTextInputModal} style={buttonStyle}>Ввести текст</button>
        <button onClick={decreaseFontSize} style={buttonStyle}>−</button>
        <span style={{ fontSize: "18px", color: isDarkMode ? "#FFFFFF" : "#000000" }}>{fontSize}px</span>
        <button onClick={increaseFontSize} style={buttonStyle}>+</button>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          style={{ width: "40px", height: "30px", border: "none", cursor: "pointer" }}
        />
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={buttonStyle}>
          Загрузить книгу
        </label>
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={buttonStyle}>
          {isDarkMode ? "Светлая тема" : "Тёмная тема"}
        </button>
        <button onClick={() => setIsRepeatMode(!isRepeatMode)} style={buttonStyle}>
          {isRepeatMode ? "Режим чтения" : "Режим повтора"}
        </button>
        {isRepeatMode && <span style={{ fontSize: "18px", color: isDarkMode ? "#FFFFFF" : "#000000" }}>Очки: {score}</span>}
      </div>
      {/* Полоска прогресса */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
        <input
          type="range"
          min="0"
          max="100"
          value={getCurrentPercentage()}
          onChange={(e) => goToPercentage(e.target.value)}
          style={{ flex: 1, cursor: "pointer" }}
        />
        <span style={{ fontSize: "16px", color: isDarkMode ? "#FFFFFF" : "#000000" }}>{Math.round(getCurrentPercentage())}%</span>
      </div>
      {/* Кнопки перехода между блоками */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button onClick={() => goToChunk(currentChunkIndex - 3)} disabled={currentChunkIndex - 3 < 0} style={buttonStyle}>
          -3
        </button>
        <button onClick={() => goToChunk(currentChunkIndex - 2)} disabled={currentChunkIndex - 2 < 0} style={buttonStyle}>
          -2
        </button>
        <button onClick={() => goToChunk(currentChunkIndex - 1)} disabled={currentChunkIndex === 0} style={buttonStyle}>
          -1
        </button>
        <button onClick={() => goToChunk(currentChunkIndex + 1)} disabled={currentChunkIndex === chunks.length - 1} style={buttonStyle}>
          +1
        </button>
        <button onClick={() => goToChunk(currentChunkIndex + 2)} disabled={currentChunkIndex + 2 >= chunks.length} style={buttonStyle}>
          +2
        </button>
        <button onClick={() => goToChunk(currentChunkIndex + 3)} disabled={currentChunkIndex + 3 >= chunks.length} style={buttonStyle}>
          +3
        </button>
      </div>
    </div>
  );
}

export default Header;