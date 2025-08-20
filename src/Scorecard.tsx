import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import pandaImage from "./panda.jpg";
import bambooImage from "./bamboo.png";
import { ref, set, onValue, remove } from "firebase/database";
import { useLocation } from "react-router-dom";
import "./App.css";

type ModalData = { row: number | null; col: number | null; type: string | null };

const Scorecard = () => {
  const location = useLocation();
  const username =
    location.state?.username ||
    localStorage.getItem("username") ||
    "Guest";

  const columns = ["Round","Yellow","Purple","Blue","Red","Green","Clear","Pink","Total"];
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  const [grid, setGrid] = useState(Array.from({ length: 10 }, () => Array(9).fill("")));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ModalData>({ row: null, col: null, type: null });
  const [inputValue, setInputValue] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [redDice, setRedDice] = useState({ diceCount: "", diceSum: "" });
  const [users, setUsers] = useState<{ name: string; total: number }[]>([]);

  // --- calculate total from grid ---
  const calculateTotals = (grid: string[][]) => {
    return grid.map((row, i) => {
      if (i === 0) return row;
      const total = row.slice(1, -1).reduce((sum, cell) => sum + (parseInt(cell) || 0), 0);
      row[row.length - 1] = total.toString();
      return row;
    });
  };

  // --- save grid and total to firebase ---
  const saveGrid = (updatedGrid: string[][]) => {
    const totals = updatedGrid.map((row) => parseInt(row[row.length - 1]) || 0);
    const totalScore = totals.reduce((a, b) => a + b, 0);

    set(ref(db, "users/" + username), {
      grid: updatedGrid,
      total: totalScore,
    });
  };

  // --- cell click handler ---
  const handleCellClick = (row: number, col: number) => {
    if (row > 0 && col > 0 && col < columns.length - 1) {
      setModalData({ row, col, type: columns[col] });
      setModalVisible(true);
    }
  };

  // --- confirm modal entry ---
  const handleConfirm = () => {
    if (modalData.row !== null && modalData.col !== null) {
      const newGrid = grid.map((r) => [...r]);
      newGrid[modalData.row][modalData.col] = inputValue;
      setGrid(newGrid);
      saveGrid(calculateTotals(newGrid));
    }
    setInputValue("");
    setCheckbox(false);
    setModalVisible(false);
  };

  // --- reset just this user's grid ---
  const handleReset = () => {
    const newGrid = Array.from({ length: 10 }, () => Array(9).fill(""));
    setGrid(newGrid);
    saveGrid(newGrid);
  };

  // --- reset all players ---
  const handleResetAll = () => {
    remove(ref(db, "users"));
    setUsers([]);
  };

  // --- listen for firebase updates ---
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([name, value]: any) => ({
          name,
          total: value.total || 0,
        }));
        // sort leaderboard high -> low
        userList.sort((a, b) => b.total - a.total);
        setUsers(userList);
      }
    });
  }, []);

  return (
    <div
      style={{
        backgroundImage: `url(${pandaImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Panda Royale Scorecard</h1>

      {/* Leaderboard */}
      <div
        style={{
          backgroundColor: "rgba(200,200,200,0.9)",
          borderRadius: "12px",
          padding: "15px",
          maxWidth: "300px",
          marginBottom: "20px",
        }}
      >
        <h2>Leaderboard</h2>
        <ul>
          {users.map((user, i) => (
            <li key={i}>
              {user.name}: {user.total}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleReset}>Reset My Scorecard</button>
      <button onClick={handleResetAll}>Reset All</button>

      {/* Scorecard grid */}
      <table>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              <td>{row}</td>
              {columns.slice(1).map((_, cIdx) => (
                <td key={cIdx} onClick={() => handleCellClick(rIdx, cIdx + 1)}>
                  {grid[rIdx][cIdx + 1]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter {modalData.type} Value</h2>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={checkbox}
                onChange={() => setCheckbox(!checkbox)}
              />
              Bamboo
            </label>
            {checkbox && <img src={bambooImage} alt="bamboo" width="30" />}
            <button onClick={handleConfirm}>Confirm</button>
            <button onClick={() => setModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scorecard;
