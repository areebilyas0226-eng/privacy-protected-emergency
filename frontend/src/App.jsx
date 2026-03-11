import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* QR FLOW */

import QRResolver from "./pages/QRResolver";

import VehicleActivatePage from "./pages/VehicleActivatePage";
import VehicleRegisterPage from "./pages/VehicleRegisterPage";
import VehicleEmergencyPage from "./pages/VehicleEmergencyPage";

import PetActivatePage from "./pages/PetActivatePage";
import PetRegisterPage from "./pages/PetRegisterPage";
import PetEmergencyPage from "./pages/PetEmergencyPage";

import ExpiredPage from "./pages/ExpiredPage";
import SubscriptionPage from "./pages/SubscriptionPage";

/* ADMIN */

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

        const res = await fetch(`${API_BASE}/api/admin/me`, {
          credentials: "include"
        });

        setIsAuth(res.ok);

      } catch {

        setIsAuth(false);

      }

      setLoading(false);

    }

    checkAuth();

  }, []);

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px"
        }}
      >
        Checking authentication...
      </div>
    );

  }

  return isAuth ? children : <Navigate to="/admin-login" replace />;

}


/* =========================
APP ROUTER
========================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ======================
        DEFAULT
        ====================== */}

        <Route path="/" element={<Navigate to="/admin-login" replace />} />

        {/* ======================
        QR ENTRY
        ====================== */}

        <Route path="/qr/:code" element={<QRResolver />} />

        {/* ======================
        VEHICLE FLOW
        ====================== */}

        <Route path="/vehicle-activate/:code" element={<VehicleActivatePage />} />
        <Route path="/vehicle-register/:code" element={<VehicleRegisterPage />} />
        <Route path="/vehicle-emergency/:code" element={<VehicleEmergencyPage />} />

        {/* ======================
        PET FLOW
        ====================== */}

        <Route path="/pet-activate/:code" element={<PetActivatePage />} />
        <Route path="/pet-register/:code" element={<PetRegisterPage />} />
        <Route path="/pet-emergency/:code" element={<PetEmergencyPage />} />

        {/* ======================
        COMMON
        ====================== */}

        <Route path="/expired/:code" element={<ExpiredPage />} />
        <Route path="/subscription/:code" element={<SubscriptionPage />} />

        {/* ======================
        ADMIN
        ====================== */}

        <Route path="/admin-login" element={<AdminLogin />} />

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

        {/* ======================
        QR ROOT SCAN (KEEP LAST)
        ====================== */}

        <Route path="/:code" element={<QRResolver />} />

        {/* ======================
        FALLBACK
        ====================== */}

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;