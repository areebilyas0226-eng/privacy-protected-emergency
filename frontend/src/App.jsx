import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import QRResolver from "./pages/QRResolver";
import ActivatePage from "./pages/ActivatePage";
import EmergencyPage from "./pages/EmergencyPage";
import ExpiredPage from "./pages/ExpiredPage";

import AdminDashboard from "./pages/admin/Dashboard";
import OrdersPage from "./pages/admin/Order";
import InventoryPage from "./pages/admin/Batches";

import AdminLogin from "./pages/AdminLogin";

const API_BASE = import.meta.env.VITE_API_URL;

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/orders`, {
          credentials: "include"
        });

        setIsAuth(res.ok);
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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/admin-login" replace />} />

        {/* Public Routes */}
        <Route path="/qr/:code" element={<QRResolver />} />
        <Route path="/activate/:code" element={<ActivatePage />} />
        <Route path="/emergency/:code" element={<EmergencyPage />} />
        <Route path="/expired/:code" element={<ExpiredPage />} />
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