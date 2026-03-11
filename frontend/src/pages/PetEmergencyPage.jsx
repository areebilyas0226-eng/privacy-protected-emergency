import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function PetEmergencyPage() {

  const { code } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {

    async function fetchData() {

      const res = await fetch(`${API_BASE}/api/pet/emergency/${code}`);
      const result = await res.json();

      setData(result);

    }

    fetchData();

  }, [code]);

  if (!data) return <div>Loading...</div>;

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <h2>Pet Emergency Info</h2>

        <p><strong>Pet Name:</strong> {data.pet_name}</p>
        <p><strong>Pet Type:</strong> {data.pet_type}</p>
        <p><strong>Breed:</strong> {data.breed}</p>
        <p><strong>Color:</strong> {data.color}</p>

        <p><strong>Owner:</strong> {data.owner_name}</p>

        <a href={`tel:${data.owner_mobile}`} style={styles.call}>
          Call Owner
        </a>

        <a href={`tel:${data.emergency_contact}`} style={styles.call2}>
          Call Emergency Contact
        </a>

      </div>

    </div>

  );

}

const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)"
  },

  card: {
    width: "420px",
    padding: "35px",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(25px)",
    borderRadius: "20px",
    color: "#fff"
  },

  call: {
    display: "block",
    marginTop: "15px",
    padding: "12px",
    background: "#ef4444",
    textAlign: "center",
    color: "#fff",
    borderRadius: "10px",
    textDecoration: "none"
  },

  call2: {
    display: "block",
    marginTop: "10px",
    padding: "12px",
    background: "#f59e0b",
    textAlign: "center",
    color: "#fff",
    borderRadius: "10px",
    textDecoration: "none"
  }

};