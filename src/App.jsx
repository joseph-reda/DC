import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import EngineerPage from "./pages/EngineerPage";
import DcPage from "./pages/DcPage";
import LoginPage from "./pages/LoginPage";
import ProjectsAdmin from "./pages/ProjectsAdmin";


export default function App() {
  // ✅ state لتخزين المستخدم الحالي
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "null");
  });

  // تحديث الـ state إذا تغير localStorage (اختياري)
  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <>
      {/* Navbar يظهر فقط عند وجود مستخدم */}
      {user && <Navbar />}

      <main className="container mx-auto p-4">
        <Routes>
          <Route
            path="/admin/projects"
            element={
              user?.role === "dc" ? (
                <ProjectsAdmin />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Login */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />

          {/* Engineer */}
          <Route
            path="/"
            element={
              user?.role === "engineer" ? (
                <EngineerPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* DC */}
          <Route
            path="/dc"
            element={
              user?.role === "dc" ? <DcPage /> : <Navigate to="/login" replace />
            }
          />

          {/* أي رابط غير معروف */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </>
  );
}
