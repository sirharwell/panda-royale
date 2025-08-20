import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pandaImage from "./bamboo.png";
import { getDatabase, ref, get } from "firebase/database";
import "./App.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("⚠️ Please enter a username.");
      return;
    }

    const db = getDatabase();
    const usersRef = ref(db, "users/" + username.trim());

    try {
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        setError("❌ Username already taken. Please try again.");
      } else {
        // save username locally so scorecard can use it
        localStorage.setItem("username", username.trim());
        navigate("/scorecard", { state: { username: username.trim() } });
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setError("⚠️ Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${pandaImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(240,240,240,0.9)",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>🐼 Panda Royale</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        {error && (
          <p style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}>
            {error}
          </p>
        )}
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
