import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ActivatePage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkQR() {
      try {
        const res = await fetch(`${API_BASE_URL}/qr/${code}`);

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("Invalid server response");
        }

        if (!res.ok) {
          if (data?.message === "QR not activated") {
            setLoading(false);
            return;
          }

          if (data?.message === "QR expired") {
            navigate(`/expired/${code}`);
            return;
          }

          setError(data?.message || "Unknown error");
          setLoading(false);
          return;
        }

        // If active → redirect to emergency
        navigate(`/emergency/${code}`);

      } catch (err) {
        setError(err.message || "Server not reachable");
        setLoading(false);
      }
    }

    checkQR();
  }, [code, navigate]);

  if (loading) return <h2>Checking QR status...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div>
      <h1>Activate QR</h1>
      <p>QR Code: {code}</p>
      <p>Please complete activation process.</p>
    </div>
  );
}