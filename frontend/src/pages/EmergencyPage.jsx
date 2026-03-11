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

        // Redirect logic based on backend status
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
    return <h2 style={{ padding: 40 }}>Loading...</h2>;
  }

  if (error) {
    return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  }

  return (

    <div
      style={{
        padding: 30,
        maxWidth: 500,
        margin: "0 auto",
        fontFamily: "Arial"
      }}
    >

      <h1 style={{ textAlign: "center", marginBottom: 30 }}>
        Emergency Information
      </h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 20,
          marginBottom: 30,
          background: "#fafafa"
        }}
      >

        <p><strong>QR Code:</strong> {data?.qr_code}</p>
        <p><strong>Vehicle Number:</strong> {data?.vehicle_number}</p>
        <p><strong>Owner Name:</strong> {data?.owner_name}</p>
        <p><strong>Blood Group:</strong> {data?.blood_group}</p>
        <p><strong>Vehicle Model:</strong> {data?.model}</p>

      </div>

      <h3 style={{ marginBottom: 15 }}>Emergency Actions</h3>

      <div
        style={{
          display: "grid",
          gap: 12
        }}
      >

        <a
          href={`tel:${data?.owner_mobile}`}
          style={{
            background: "#e53935",
            color: "white",
            padding: "14px",
            textAlign: "center",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Call Owner
        </a>

        <a
          href={`tel:${data?.emergency_contact}`}
          style={{
            background: "#fb8c00",
            color: "white",
            padding: "14px",
            textAlign: "center",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Call Emergency Family
        </a>

        <a
          href="tel:102"
          style={{
            background: "#43a047",
            color: "white",
            padding: "14px",
            textAlign: "center",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Call Ambulance (102)
        </a>

        <a
          href="tel:100"
          style={{
            background: "#1e88e5",
            color: "white",
            padding: "14px",
            textAlign: "center",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Call Police (100)
        </a>

        <a
          href="tel:101"
          style={{
            background: "#6d4c41",
            color: "white",
            padding: "14px",
            textAlign: "center",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Call Fire (101)
        </a>

      </div>

    </div>

  );

}