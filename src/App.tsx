import React, { useState } from "react";
import pandaImage from "./panda.jpg";
import bambooImage from "./bamboo.png";
import "./App.css"; // Assuming a CSS file for styling

type ModalData = {
  row: number | null;
  col: number | null;
  type: string | null;
};

const App = () => {
  const columns = [
    "Round",
    "Yellow",
    "Purple",
    "Blue",
    "Red",
    "Green",
    "Clear",
    "Pink",
    "Total",
  ];
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  const [grid, setGrid] = useState(
    Array.from({ length: 10 }, () => Array.from({ length: 9 }, () => ""))
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({
    row: null,
    col: null,
    type: null,
  });
  const [inputValue, setInputValue] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [redDice, setRedDice] = useState({ diceCount: "", diceSum: "" });

  const calculateTotalSum = () => {
    return grid.reduce((sum, row) => sum + (Number(row[8]) || 0), 0);
  };

  const handleCellPress = (row: number, col: number) => {
    if (col === 0) return; // Skip the "Round" column
    const columnName = columns[col];
    if (["Yellow", "Purple", "Green", "Clear", "Pink"].includes(columnName)) {
      setModalData({ row, col, type: columnName });
      setInputValue("");
      setModalVisible(true);
    } else if (columnName === "Blue") {
      setModalData({ row, col, type: columnName });
      setInputValue("");
      setCheckbox(false);
      setModalVisible(true);
    } else if (columnName === "Red") {
      setModalData({ row, col, type: columnName });
      setRedDice({ diceCount: "", diceSum: "" });
      setModalVisible(true);
    }
  };

  const handleInputSubmit = () => {
    const { row, col, type } = modalData;
    if (row === null || col === null || type === null) return; // Guard clause

    const updatedGrid = [...grid];

    if (type === "Yellow") {
      updatedGrid[row][col] = inputValue;
    } else if (type === "Purple") {
      updatedGrid[row][col] = (Number(inputValue) * 2).toString();
    } else if (type === "Blue") {
      const value = checkbox ? Number(inputValue) * 2 : Number(inputValue);
      updatedGrid[row][col] = value.toString();
    } else if (type === "Red") {
      const value = Number(redDice.diceCount) * Number(redDice.diceSum);
      updatedGrid[row][col] = value.toString();
    } else if (["Green", "Clear", "Pink"].includes(type)) {
      updatedGrid[row][col] = inputValue;
    }

    updatedGrid[row][8] = columns
      .slice(1, 8)
      .reduce((sum, _, i) => sum + (Number(updatedGrid[row][i + 1]) || 0), 0)
      .toString();
    setGrid(updatedGrid);
    setModalVisible(false);
  };

  const getCellBackgroundColor = (colIndex: number) => {
    switch (columns[colIndex]) {
      case "Yellow":
        return "rgba(244, 255, 135, 0.75)";
      case "Purple":
        return "rgba(232, 176, 255, 0.75)";
      case "Blue":
        return "rgba(135, 171, 255, 0.75)";
      case "Red":
        return "rgba(255, 135, 135, 0.75)";
      case "Green":
        return "rgba(135, 255, 135, 0.75)";
      case "Clear":
        return "rgba(255, 255, 255, 0.75)";
      case "Pink":
        return "rgba(255, 192, 203, 0.75)";
      default:
        return "rgba(240, 240, 240, 0.75)";
    }
  };

  return (
    <div className="container">
      <div
        className="image-background"
        style={{ backgroundImage: `url(${bambooImage})` }}
      >
        <img src={pandaImage} alt="Panda" className="panda-image" />
        <div className="grid-container">
          <div className="row header-row">
            {columns.map((col, index) => (
              <div key={index} className="cell header-cell">
                {col}
              </div>
            ))}
          </div>
          {rows.map((rowNum, rowIndex) => (
            <div key={rowIndex} className="row">
              {columns.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="cell"
                  style={{
                    backgroundColor:
                      colIndex === 0
                        ? "#ddd"
                        : getCellBackgroundColor(colIndex),
                  }}
                  onClick={() => handleCellPress(rowIndex, colIndex)}
                >
                  {colIndex === 0 ? rowNum : grid[rowIndex][colIndex]}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="total-container">
          <span className="total-text">Total Sum: {calculateTotalSum()}</span>
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalData.type === "Red" ? (
              <>
                <label>How many red dice?</label>
                <input
                  type="number"
                  value={redDice.diceCount}
                  onChange={(e) =>
                    setRedDice({ ...redDice, diceCount: e.target.value })
                  }
                />
                <label>Dice Sum:</label>
                <input
                  type="number"
                  value={redDice.diceSum}
                  onChange={(e) =>
                    setRedDice({ ...redDice, diceSum: e.target.value })
                  }
                />
              </>
            ) : modalData.type === "Blue" ? (
              <>
                <label>Enter blue dice totals:</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <div className="checkbox-container">
                  <label>Do you have a sparkly blue?</label>
                  <input
                    type="checkbox"
                    checked={checkbox}
                    onChange={() => setCheckbox(!checkbox)}
                  />
                </div>
              </>
            ) : (
              <>
                <label>Enter a value:</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </>
            )}
            <button onClick={handleInputSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
