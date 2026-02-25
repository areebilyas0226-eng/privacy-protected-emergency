import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import QRResolver from "./pages/QRResolver";
import ActivatePage from "./pages/ActivatePage";
import EmergencyPage from "./pages/EmergencyPage";
import ExpiredPage from "./pages/ExpiredPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

/* ===============================
   ENV
=============================== */
const API_BASE = import.meta.env.VITE_API_URL;

/* ===============================
   Protected Route (JWT Verified)
=============================== */
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/admin/orders`, {
          credentials: "include",
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

  return isAuth ? children : <Navigate to="/admin-login" replace />;
}

/* ===============================
   App
=============================== */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root → Redirect to Admin Login */}
        <Route path="/" element={<Navigate to="/admin-login" replace />} />

        {/* Public QR */}
        <Route path="/qr/:code" element={<QRResolver />} />

        {/* Activation Flow */}
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
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;