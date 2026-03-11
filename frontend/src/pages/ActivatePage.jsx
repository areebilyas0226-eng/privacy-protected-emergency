import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ActivatePage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [qrType, setQrType] = useState("vehicle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchQR() {

      try {

        const res = await fetch(`${API_BASE}/api/emergency/${code}`);
        const data = await res.json();

        if (data.qr_type) {
          setQrType(data.qr_type);
        }

      } catch (err) {
        console.error(err);
      }

      setLoading(false);

    }

    fetchQR();

  }, [code]);


  function startRegistration() {

    if (qrType === "pet") {
      navigate(`/pet-register/${code}`);
    } else {
      navigate(`/register/${code}`);
    }

  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>Activate Emergency Tag</h2>

        <p style={styles.text}>
          {qrType === "pet"
            ? "You are about to activate your pet emergency QR tag. In the next step you will enter pet details, owner information and emergency contact."
            : "You are about to activate your vehicle emergency QR tag. In the next step you will enter owner details, vehicle number and emergency contact information."
          }
        </p>

        <button
          onClick={startRegistration}
          style={styles.button}
        >
          Continue
        </button>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    padding: "20px"
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(25px)",
    padding: "35px",
    borderRadius: "20px",
    textAlign: "center",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.25)"
  },

  title: {
    marginBottom: "20px",
    fontSize: "24px"
  },

  text: {
    lineHeight: 1.6,
    fontSize: "15px"
  },

  button: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  }

};