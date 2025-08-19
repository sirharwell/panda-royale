import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import Scorecard from "./Scorecard";

console.log("App loaded ✅");
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/scorecard" element={<Scorecard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
