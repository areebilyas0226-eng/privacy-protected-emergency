import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE =
  "https://privacy-protected-emergency-production-581f.up.railway.app";

export default function QRResolver() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;

    async function resolveQR() {
      try {
        const res = await fetch(`${API_BASE}/api/qr/${code}`);
        const result = await res.json();

        if (res.status === 404) {
          navigate("/not-found");
          return;
        }

        if (res.status === 403) {
          if (result.message === "QR expired") {
            navigate(`/expired/${code}`);
          } else {
            navigate(`/activate/${code}`);
          }
          return;
        }

        if (!res.ok) {
          throw new Error(result?.message || "Failed to resolve QR");
        }

        // If active → emergency
        navigate(`/emergency/${code}`);

      } catch (err) {
        setError("Unable to verify QR");
      }
    }

    resolveQR();
  }, [code, navigate]);

  if (error) {
    return (
      <div style={{ padding: "40px", color: "red" }}>
        {error}
      </div>
    );
  }

  return <div style={{ padding: "40px" }}>Checking QR status...</div>;
}