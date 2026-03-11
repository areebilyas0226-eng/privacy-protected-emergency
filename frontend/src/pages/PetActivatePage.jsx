import { useParams, useNavigate } from "react-router-dom";

export default function PetActivatePage() {

  const { code } = useParams();
  const navigate = useNavigate();

  function startRegistration() {
    navigate(`/pet-register/${code}`);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>Activate Pet Emergency Tag</h2>

        <p style={styles.text}>
          You are about to activate your pet emergency QR tag.
          <br /><br />
          In the next step you will enter pet details, owner contact,
          and emergency contact information.
        </p>

        <button onClick={startRegistration} style={styles.button}>
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
    border: "1px solid rgba(255,255,255,0.3)"
  },

  title: { marginBottom: "20px" },

  text: { lineHeight: 1.6 },

  button: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  }
};