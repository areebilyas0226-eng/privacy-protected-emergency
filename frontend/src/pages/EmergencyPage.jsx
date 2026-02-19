import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE =
  "https://privacy-protected-emergency-production-581f.up.railway.app";

export default function EmergencyPage() {
  const { code } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    if (!code) {
      setError("Invalid QR code");
      setLoading(false);
      return;
    }

    async function fetchQR() {
      try {
        const response = await fetch(`${API_BASE}/api/qr/${code}`);

        const text = await response.text();
        let result;

        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Invalid server response");
        }

        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch QR data");
        }

        setData(result);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchQR();
  }, [code]);

  async function handleCallOwner() {
    try {
      setCalling(true);

      const res = await fetch(
        `${API_BASE}/api/qr/${code}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action_type: "call"
          })
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Call failed");
      }

      if (!data?.owner_mobile)
        throw new Error("Owner mobile not available");

      window.location.href = `tel:${data.owner_mobile}`;

    } catch (err) {
      alert(err.message);
    } finally {
      setCalling(false);
    }
  }

  if (loading)
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;

  if (error)
    return (
      <div style={{ padding: "40px", color: "red" }}>
        <h2>{error}</h2>
      </div>
    );

  return (
    <div style={{ padding: "40px" }}>
      <h1>Emergency Mode</h1>

      <p><strong>QR Code:</strong> {data?.qr_code}</p>

      {data?.vehicle_number ? (
        <>
          <p><strong>Vehicle Number:</strong> {data.vehicle_number}</p>
          <p><strong>Model:</strong> {data.model || "N/A"}</p>
          <p><strong>Blood Group:</strong> {data.blood_group || "N/A"}</p>

          <button
            onClick={handleCallOwner}
            disabled={calling}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              cursor: "pointer",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}
          >
            {calling ? "Connecting..." : "Call Owner"}
          </button>
        </>
      ) : (
        <p>No vehicle data linked to this QR.</p>
      )}
    </div>
  );
}