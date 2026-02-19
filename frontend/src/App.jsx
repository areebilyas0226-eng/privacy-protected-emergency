import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import QRResolver from "./pages/QRResolver";
import ActivatePage from "./pages/ActivatePage";
import EmergencyPage from "./pages/EmergencyPage";
import ExpiredPage from "./pages/ExpiredPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route path="/" element={<div style={{ padding: 40 }}>VahanTag System Running</div>} />

        {/* Public QR */}
        <Route path="/qr/:code" element={<QRResolver />} />

        {/* Internal */}
        <Route path="/activate/:code" element={<ActivatePage />} />
        <Route path="/emergency/:code" element={<EmergencyPage />} />
        <Route path="/expired/:code" element={<ExpiredPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;