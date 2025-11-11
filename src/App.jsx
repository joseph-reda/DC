import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import EngineerPage from "./pages/EngineerPage";
import DcPage from "./pages/DcPage";
import LoginPage from "./pages/LoginPage";
import "./main.css";
export default function App() {
  return (
    <div>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<EngineerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dc" element={<DcPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
