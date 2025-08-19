import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import pandaImage from "./panda.jpg";
import bambooImage from "./bamboo.png";
import { ref, set, onValue, remove, update } from "firebase/database";
import "./App.css";

type ModalData = { row: number | null; col: number | null; type: string | null; };

const Scorecard = () => {
  const username = localStorage.getItem("username") || "Guest";

  const columns = ["Round","Yellow","Purple","Blue","Red","Green","Clear","Pink","Total"];
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  const [grid, setGrid] = useState(Array.from({ length: 10 }, () => Array(9).fill("")));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({ row: null, col: null, type: null });
  const [inputValue, setInputValue] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [redDice, setRedDice] = useState({ diceCount: "", diceSum: "" });
  const [leaderboard, setLeaderboard] = useState<{name:string,total:number}[]>([]);

  const calculateTotalSum = (gridData = grid) => {
    return gridData.reduce((sum, row) => sum + (Number(row[8]) || 0), 0);
  };

  // Load user data from Firebase
  useEffect(() => {
    const userRef = ref(db, `users/${username}/grid`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setGrid(snapshot.val());
      }
    });

    // Leaderboard subscription
    const allUsersRef = ref(db, "users");
    onValue(allUsersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const lb = Object.keys(data).map(name => ({
        name,
        total: data[name].total || 0
      }));
      setLeaderboard(lb);
    });
  }, [username]);

  const saveGrid = (newGrid: string[][]) => {
    const total = calculateTotalSum(newGrid);
    set(ref(db, `users/${username}`), {
      grid: newGrid,
      total
    });
  };

  const handleCellPress = (row:number, col:number) => {
    if (col === 0) return;
    const columnName = columns[col];
    setModalData({ row, col, type: columnName });
    setInputValue("");
    setCheckbox(false);
    setRedDice({ diceCount: "", diceSum: "" });
    setModalVisible(true);
  };

  const handleInputSubmit = () => {
    const { row, col, type } = modalData;
    if (row === null || col === null || type === null) return;

    const updatedGrid = [...grid.map(r => [...r])];

    if (type === "Yellow") {
      updatedGrid[row][col] = inputValue;
    } else if (type === "Purple") {
      updatedGrid[row][col] = (Number(inputValue) * 2).toString();
    } else if (type === "Blue") {
      updatedGrid[row][col] = (checkbox ? Number(inputValue) * 2 : Number(inputValue)).toString();
    } else if (type === "Red") {
      updatedGrid[row][col] = (Number(redDice.diceCount) * Number(redDice.diceSum)).toString();
    } else {
      updatedGrid[row][col] = inputValue;
    }

    updatedGrid[row][8] = columns.slice(1,8).reduce(
      (sum,_,i) => sum + (Number(updatedGrid[row][i+1])||0), 0
    ).toString();

    setGrid(updatedGrid);
    saveGrid(updatedGrid);
    setModalVisible(false);
  };

  const getCellBackgroundColor = (colIndex:number) => {
    switch (columns[colIndex]) {
      case "Yellow": return "rgba(244,255,135,0.75)";
      case "Purple": return "rgba(232,176,255,0.75)";
      case "Blue":   return "rgba(135,171,255,0.75)";
      case "Red":    return "rgba(255,135,135,0.75)";
      case "Green":  return "rgba(135,255,135,0.75)";
      case "Clear":  return "rgba(255,255,255,0.75)";
      case "Pink":   return "rgba(255,192,203,0.75)";
      default:       return "rgba(240,240,240,0.75)";
    }
  };
    const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all scorecards?")) {
      const emptyGrid = Array.from({ length: 10 }, () => Array(9).fill(""));
      const updates: any = {};
      leaderboard.forEach((u) => {
        updates[`users/${u.name}/grid`] = emptyGrid;
        updates[`users/${u.name}/total`] = 0;
      });
      update(ref(db), updates);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to DELETE ALL users? This cannot be undone.")) {
      remove(ref(db, "users"));
      localStorage.removeItem("username"); // clear own username
      window.location.href = "/"; // redirect to login
    }
  };


  return (
    <div className="container">
      <div className="image-background" style={{ backgroundImage: `url(${bambooImage})` }}>
        <img src={pandaImage} alt="Panda" className="panda-image" />

        <div className="grid-container">
          <div className="row header-row">
            {columns.map((col, index) => (
              <div key={index} className="cell header-cell">{col}</div>
            ))}
          </div>
          {rows.map((rowNum, rowIndex) => (
            <div key={rowIndex} className="row">
              {columns.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="cell"
                  style={{ backgroundColor: colIndex===0?"#ddd":getCellBackgroundColor(colIndex) }}
                  onClick={() => handleCellPress(rowIndex,colIndex)}
                >
                  {colIndex===0 ? rowNum : grid[rowIndex][colIndex]}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="total-container">
          <span className="total-text">Total Sum: {calculateTotalSum()}</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        {leaderboard.map((u) => (
          <div key={u.name}>{u.name}: {u.total}</div>
        ))}

        {/* Admin buttons */}
        <div className="admin-controls">
          <button onClick={handleResetAll}>Reset All Scorecards</button>
          <button onClick={handleDeleteAll}>Delete All Users</button>
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalData.type === "Red" ? (
              <>
                <label>How many red dice?</label>
                <input type="number" value={redDice.diceCount} onChange={(e)=>setRedDice({...redDice,diceCount:e.target.value})}/>
                <label>Dice Sum:</label>
                <input type="number" value={redDice.diceSum} onChange={(e)=>setRedDice({...redDice,diceSum:e.target.value})}/>
              </>
            ) : modalData.type === "Blue" ? (
              <>
                <label>Enter blue dice totals:</label>
                <input type="number" value={inputValue} onChange={(e)=>setInputValue(e.target.value)} />
                <div>
                  <label>Sparkly blue?</label>
                  <input type="checkbox" checked={checkbox} onChange={()=>setCheckbox(!checkbox)} />
                </div>
              </>
            ) : (
              <>
                <label>Enter a value:</label>
                <input type="number" value={inputValue} onChange={(e)=>setInputValue(e.target.value)} />
              </>
            )}
            <button onClick={handleInputSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scorecard;
