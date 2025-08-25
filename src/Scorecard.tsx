import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import pandaImage from "./panda.jpg";
import bambooImage from "./bamboo.png";
import { getDatabase, ref, set, onValue, remove, update, get } from "firebase/database";
import "./App.css";
import { useLocation } from "react-router-dom";

type ModalData = { row: number | null; col: number | null; type: string | null; };


  interface UserData {
  name: string;
  score: number;
  grid: string[][];
}

const Scorecard = () => {
  const location = useLocation();
  const columns = ["Round","Yellow","Purple","Blue","Red","Green","Clear","Pink","Total"];
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  const username = location.state?.username;
  const [grid, setGrid] = useState(Array.from({ length: 10 }, () => Array(9).fill("")));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({ row: null, col: null, type: null });
  const [inputValue, setInputValue] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [redDice, setRedDice] = useState({ diceCount: "", diceSum: "" });
  const [leaderboard, setLeaderboard] = useState<{name:string,total:number}[]>([]);
  const [score, setScore] = useState(0);
  const [users, setUsers] = useState<UserData[]>([]);
  const calculateTotalSum = (gridData = grid) => {
    return gridData.reduce((sum, row) => sum + (Number(row[8]) || 0), 0);
  };


  // Load user data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formatted = Object.entries(data).map(([name, info]: any) => ({
        name,
        score: info.total || 0, // use total instead of score
        grid: info.grid || Array.from({ length: 10 }, () => Array(9).fill("")),
      }));

      // sort highest → lowest
      formatted.sort((a, b) => b.score - a.score);
      setUsers(formatted);
    });
  }, []);

  useEffect(() => {
  if (!username) return;
  const db = getDatabase();
  const userRef = ref(db, "users/" + username);

  return onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data?.grid) {
      setGrid(data.grid);
    }
  });
}, [username]);


  const handleScoreChange = (delta: number) => {
    const db = getDatabase();
    const newScore = score + delta;
    setScore(newScore);
    set(ref(db, "users/" + username), { score: newScore });
  };

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
  const handleResetAll = async () => {
  if (!window.confirm("Are you sure you want to reset all scorecards?")) return;
  const db = getDatabase();
  const usersSnap = await get(ref(db, "users"));
  if (!usersSnap.exists()) return;

  const emptyGrid = Array.from({ length: 10 }, () => Array(9).fill(""));
  const updates: Record<string, any> = {};

  const usersObj = usersSnap.val();
  Object.keys(usersObj).forEach((name) => {
    updates[`users/${name}/grid`] = emptyGrid;
    updates[`users/${name}/total`] = 0;
  });

  await update(ref(db), updates);

  // 🔑 If you want *this user’s* scorecard cleared right away:
  if (username) {
    setGrid(emptyGrid);  // local React state
  }
};

const getCellStyle = (rowIndex: number, colIndex: number) => {
  const baseColor = getCellBackgroundColor(colIndex);

  // Only apply special logic for Yellow column
  if (columns[colIndex] === "Yellow") {
    const yellowValues = users.map(u => {
      const rowVal = u?.grid?.[rowIndex]?.[colIndex];
      return Number(rowVal) || 0;
    });
    const max = Math.max(...yellowValues);
    const myVal = Number(grid[rowIndex][colIndex]) || 0;

    if (myVal > 0 && myVal === max) {
      const isTied = yellowValues.filter(v => v === max).length > 1;
      return {
        backgroundColor: isTied ? "rgba(100,149,237,0.8)" : "rgba(0,200,0,0.8)" // blue if tie, green if best
      };
    }
  }

  return { backgroundColor: baseColor };
};


  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to DELETE ALL users? This cannot be undone.")) {
      remove(ref(db, "users"));
      localStorage.removeItem("username"); // clear own username
      window.location.href = "https://sirharwell.github.io/panda-royale/"; // redirect to login
    }
  };


  return (
    <div
  className="container"
  style={{
    backgroundImage: `url(${bambooImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    padding: "20px",
  }}
>
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
                  style={colIndex === 0 ? { backgroundColor: "#ddd" } : getCellStyle(rowIndex, colIndex)}
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
      <div
    style={{
      backgroundColor: "rgba(240,240,240,0.9)",
      borderRadius: "12px",
      padding: "20px",
      maxWidth: "400px",
      margin: "20px auto",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }}
  >
    <h2 style={{ textAlign: "center", marginBottom: "12px" }}>Leaderboard</h2>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {users.map((user, index) => (
        <li
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            borderBottom: "1px solid #ddd",
          }}
        >
          <span>{user.name}</span>
          <span>{user.score}</span>
        </li>
      ))}
    </ul>
  </div>
      {/* Admin buttons */}
      <div className="admin-controls">
        <button onClick={handleResetAll}>Reset All Scorecards</button>
        <button onClick={handleDeleteAll}>Delete All Users</button>
      </div>
    </div>

  );
};

export default Scorecard;
