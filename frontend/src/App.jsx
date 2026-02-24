import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import QRResolver from "./pages/QRResolver";
import ActivatePage from "./pages/ActivatePage.jsx";
import EmergencyPage from "./pages/EmergencyPage";
import ExpiredPage from "./pages/ExpiredPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ===============================
   Protected Route (JWT Verified)
=============================== */
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/admin/orders`, {
          credentials: "include"
        });

        setIsAuth(res.status === 200);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return null;

  return isAuth ? children : <Navigate to="/admin-login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route
          path="/"
          element={
            <div style={{ padding: 40 }}>
              VahanTag System Running
            </div>
          }
        />

        {/* Public QR */}
        <Route path="/qr/:code" element={<QRResolver />} />

        {/* Internal */}
        <Route path="/activate/:code" element={<ActivatePage />} />
        <Route path="/emergency/:code" element={<EmergencyPage />} />
        <Route path="/expired/:code" element={<ExpiredPage />} />

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;