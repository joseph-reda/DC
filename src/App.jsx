import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import EngineerPage from "./pages/EngineerPage";
import DcPage from "./pages/DcPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div>
      {/* Navbar يظهر فقط إذا هناك مستخدم */}
      {user && <Navbar />}

      <main className="container">
        <Routes>
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

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

          {/* أي رابط آخر */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
