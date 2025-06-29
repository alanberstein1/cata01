import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FamilyBuilder from "./pages/FamilyBuilder";
import Admin from "./pages/AdminPanel";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build" element={<FamilyBuilder />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}