import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import QRResolver from "./pages/QRResolver";
import ActivatePage from "./pages/ActivatePage";
import EmergencyPage from "./pages/EmergencyPage";
import ExpiredPage from "./pages/ExpiredPage";
import RegisterPage from "./pages/RegisterPage";   // FIX: Missing import

import AdminDashboard from "./pages/admin/Dashboard";
import OrdersPage from "./pages/admin/Order";
import InventoryPage from "./pages/admin/Inventory";

import AdminLogin from "./pages/AdminLogin";

const API_BASE = import.meta.env.VITE_API_URL;

/* =========================
   Protected Route
========================= */
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/orders`, {
          credentials: "include",
        });

        if (res.status === 401) {
          setIsAuth(false);
        } else if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5, #06b6d4, #9333ea)",
          color: "white",
          fontSize: "18px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/admin-login" replace />;
}

/* =========================
   App
========================= */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/admin-login" replace />} />

        {/* Public QR Flow */}
        <Route path="/qr/:code" element={<QRResolver />} />
        <Route path="/register/:code" element={<RegisterPage />} />
        <Route path="/activate/:code" element={<ActivatePage />} />
        <Route path="/emergency/:code" element={<EmergencyPage />} />
        <Route path="/expired/:code" element={<ExpiredPage />} />

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
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