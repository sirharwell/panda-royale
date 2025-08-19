import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (username.trim()) {
      localStorage.setItem("username", username); // keep track
      navigate("/Scorecard");
    }
  };

  return (
    <div className="login-container">
      <h1>Enter your username</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleStart}>Start</button>
    </div>
  );
};
