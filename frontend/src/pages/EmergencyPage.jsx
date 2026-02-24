import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

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

    const controller = new AbortController();

    async function fetchQR() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/qr/${code}`,
          { signal: controller.signal }
        );

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(result?.message || "Failed to fetch QR data");
        }

        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Server error");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchQR();
    return () => controller.abort();
  }, [code]);

  async function handleCallOwner() {
    if (!data?.owner_mobile) {
      alert("Owner mobile not available");
      return;
    }

    try {
      setCalling(true);

      const res = await fetch(
        `${API_BASE_URL}/api/qr/${code}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action_type: "call" })
        }
      );

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.message || "Contact failed");
      }

      window.location.href = `tel:${data.owner_mobile}`;
    } catch (err) {
      alert(err.message);
    } finally {
      setCalling(false);
    }
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;
  if (error)
    return (
      <div style={{ padding: 40, color: "red" }}>
        <h2>{error}</h2>
      </div>
    );

  return (
    <div style={{ padding: 40 }}>
      <h1>Emergency Mode</h1>

      <p><strong>QR Code:</strong> {data?.qr_code}</p>
      <p><strong>Vehicle:</strong> {data?.vehicle_number || "-"}</p>
      <p><strong>Model:</strong> {data?.model || "-"}</p>
      <p><strong>Blood Group:</strong> {data?.blood_group || "-"}</p>

      <button
        onClick={handleCallOwner}
        disabled={calling}
        style={{
          marginTop: 20,
          padding: "12px 24px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        {calling ? "Connecting..." : "Call Owner"}
      </button>
    </div>
  );
}