import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import Scorecard from "./Scorecard";

function App() {
  return (
    <HashRouter>
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bamboo.png')" }}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/scorecard" element={<Scorecard />} />
      </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
