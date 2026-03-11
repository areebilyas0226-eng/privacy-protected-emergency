import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EmergencyPage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    async function fetchData() {

      try {

        const res = await fetch(`${API_BASE}/api/emergency/${code}`);
        const result = await res.json();

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
        setLoading(true);
      }

    }

    fetchData();

  }, [code, navigate]);



  /* ===============================
  CALL OWNER USING TWILIO API
  =============================== */

  const callOwner = async () => {

    try {

      await fetch(`${API_BASE}/api/call/owner/${code}`, {
        method: "POST"
      });

      alert("Connecting call to vehicle owner...");

    } catch (err) {

      alert("Unable to connect call");

    }

  };


  if (!loading) {
    return <h2 style={{ padding: 40 }}>Loading...</h2>;
  }

  if (error) {
    return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        padding: 30,
        maxWidth: 500,
        margin: "0 auto",
        fontFamily: "Arial",
        color: "white"
      }}
    >

      <h1
        style={{
          textAlign: "center",
          marginBottom: 30,
          fontWeight: "bold"
        }}
      >
        Emergency Information
      </h1>

      {/* GLASS CARD */}
      <div
        style={{
          borderRadius: 14,
          padding: 20,
          marginBottom: 30,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white"
        }}
      >

        {/* QR CODE REMOVED */}

        <p><strong>Vehicle Number:</strong> {data?.vehicle_number || "N/A"}</p>
        <p><strong>Owner Name:</strong> {data?.owner_name || "N/A"}</p>
        <p><strong>Blood Group:</strong> {data?.blood_group || "N/A"}</p>
        <p><strong>Vehicle Model:</strong> {data?.model || "N/A"}</p>

      </div>

      <h3 style={{ marginBottom: 15 }}>Emergency Actions</h3>

      <div
        style={{
          display: "grid",
          gap: 14
        }}
      >

        {/* CALL OWNER VIA TWILIO */}

        <button
          onClick={callOwner}
          style={{
            background: "#e53935",
            color: "white",
            padding: "16px",
            borderRadius: 10,
            border: "none",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Contact Vehicle Owner
        </button>

        {/* EMERGENCY CONTACT */}

        <a
          href={`tel:${data?.emergency_contact}`}
          style={{
            background: "#fb8c00",
            color: "white",
            padding: "16px",
            textAlign: "center",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          Call Emergency Family
        </a>

        <a
          href="tel:102"
          style={{
            background: "#43a047",
            color: "white",
            padding: "16px",
            textAlign: "center",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          Call Ambulance (102)
        </a>

        <a
          href="tel:100"
          style={{
            background: "#1e88e5",
            color: "white",
            padding: "16px",
            textAlign: "center",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          Call Police (100)
        </a>

        <a
          href="tel:101"
          style={{
            background: "#6d4c41",
            color: "white",
            padding: "16px",
            textAlign: "center",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          Call Fire (101)
        </a>

      </div>

    </div>

  );

}