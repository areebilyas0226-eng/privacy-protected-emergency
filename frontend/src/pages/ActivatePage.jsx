import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

export default function ActivatePage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleActivate() {
    if (!code) return;

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

      const data = await res.json().catch(() => ({}));

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