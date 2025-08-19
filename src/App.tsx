import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import Scorecard from "./Scorecard";
import React from "react"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/scorecard" element={<Scorecard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
