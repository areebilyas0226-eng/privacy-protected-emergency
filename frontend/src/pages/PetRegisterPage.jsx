import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function PetRegisterPage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    pet_name: "",
    pet_type: "",
    breed: "",
    color: "",
    owner_name: "",
    owner_mobile: "",
    emergency_contact: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submitForm() {

    try {

      const res = await fetch(`${API_BASE}/api/pet/register/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();

      navigate(`/pet-emergency/${code}`);

    } catch {
      alert("Registration failed");
    }

  }

  return (

    <div style={styles.page}>
      <div style={styles.card}>

        <h2>Pet Registration</h2>

        <input name="pet_name" placeholder="Pet Name" onChange={handleChange}/>
        <input name="pet_type" placeholder="Pet Type (Dog/Cat)" onChange={handleChange}/>
        <input name="breed" placeholder="Breed" onChange={handleChange}/>
        <input name="color" placeholder="Color" onChange={handleChange}/>

        <input name="owner_name" placeholder="Owner Name" onChange={handleChange}/>
        <input name="owner_mobile" placeholder="Owner Mobile" onChange={handleChange}/>
        <input name="emergency_contact" placeholder="Emergency Contact" onChange={handleChange}/>

        <button onClick={submitForm}>Register Pet</button>

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
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }
};