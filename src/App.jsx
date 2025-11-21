import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import EngineerPage from "./pages/EngineerPage";
import DcPage from "./pages/DcPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    const update = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<LoginPage setUser={setUser} />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          user?.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* DC */}
      <Route
        path="/dc"
        element={
          user?.role === "dc" ? (
            <DcPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ENGINEER */}
      <Route
        path="/engineer"
        element={
          user?.role === "engineer" ? (
            <EngineerPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}
