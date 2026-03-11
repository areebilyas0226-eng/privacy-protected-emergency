import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EmergencyPage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchData() {

      try {

        const res = await fetch(`${API_BASE}/api/emergency/${code}`);
        const result = await res.json();

        console.log("Emergency API Response:", result);

        if (result.status === "inactive") {
          navigate(`/activate/${code}`);
          return;
        }

        if (result.status === "expired") {
          navigate(`/subscribe/${code}`);
          return;
        }

        if (!res.ok) {
          throw new Error(result.message || "Failed to load emergency data");
        }

        setData(result);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    }

    fetchData();

  }, [code, navigate]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Loading emergency data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "red" }}>
        {error}
      </div>
    );
  }

  const ownerMobile = data?.owner_mobile || "";
  const emergencyMobile = data?.emergency_contact || "";

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#16c0d9,#2b7de0)",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif"
      }}
    >

      <h1
        style={{
          textAlign: "center",
          color: "white",
          marginBottom: 25
        }}
      >
        Emergency Information
      </h1>

      {/* INFO CARD */}

      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: 20,
          marginBottom: 30,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }}
      >

        <p><strong>QR Code:</strong> {data?.qr_code || "Not available"}</p>
        <p><strong>Vehicle Number:</strong> {data?.vehicle_number || "Not available"}</p>
        <p><strong>Owner Name:</strong> {data?.owner_name || "Not available"}</p>
        <p><strong>Blood Group:</strong> {data?.blood_group || "Not available"}</p>
        <p><strong>Vehicle Model:</strong> {data?.model || "Not available"}</p>

      </div>

      {/* ACTION BUTTONS */}

      <h3 style={{ color: "white", marginBottom: 15 }}>
        Emergency Actions
      </h3>

      <div
        style={{
          display: "grid",
          gap: 14
        }}
      >

        {ownerMobile && (
          <a
            href={`tel:${ownerMobile}`}
            style={btn("#e53935")}
          >
            Call Owner
          </a>
        )}

        {emergencyMobile && (
          <a
            href={`tel:${emergencyMobile}`}
            style={btn("#ff8f00")}
          >
            Call Emergency Family
          </a>
        )}

        <a href="tel:102" style={btn("#43a047")}>
          Call Ambulance (102)
        </a>

        <a href="tel:100" style={btn("#1e88e5")}>
          Call Police (100)
        </a>

        <a href="tel:101" style={btn("#6d4c41")}>
          Call Fire (101)
        </a>

      </div>

    </div>

  );

}

/* BUTTON STYLE HELPER */

function btn(color) {

  return {
    background: color,
    color: "white",
    padding: "15px",
    borderRadius: 10,
    textAlign: "center",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: 16,
    boxShadow: "0 5px 12px rgba(0,0,0,0.25)"
  };

}