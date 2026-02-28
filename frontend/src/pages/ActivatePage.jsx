import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

export default function ActivatePage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [qrValid, setQrValid] = useState(false);

  /* ===============================
     Validate QR On Page Load
  =============================== */
  useEffect(() => {
    if (!code) return;

    async function validateQR() {
      try {
        const res = await fetch(`${API_BASE}/api/qr/${code}`);

        if (!res.ok) {
          throw new Error("QR not found");
        }

        setQrValid(true);
      } catch (err) {
        setError("QR not found");
      } finally {
        setChecking(false);
      }
    }

    validateQR();
  }, [code]);

  /* ===============================
     Activate Handler
  =============================== */
  async function handleActivate() {
    if (!code || !qrValid) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/qr/${code}/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        throw new Error(data?.message || "Activation failed");
      }

      navigate(`/emergency/${code}`);
    } catch (err) {
      setError(err.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI STATES
  =============================== */
  if (checking) {
    return <div style={{ padding: 40 }}>Checking QR...</div>;
  }

  if (error && !qrValid) {
    return (
      <div style={{ padding: 40 }}>
        <h2 style={{ color: "red" }}>{error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Activate QR Code</h1>
      <p>QR: {code}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleActivate}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        {loading ? "Activating..." : "Activate"}
      </button>
    </div>
  );
}