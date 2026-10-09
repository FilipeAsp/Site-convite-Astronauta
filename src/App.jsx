// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicView from "./pages/PublicView";
import AdminView from "./pages/AdminView"; // Importamos o Admin

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </BrowserRouter>
  );
}