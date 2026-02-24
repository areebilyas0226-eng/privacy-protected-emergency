import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ActivatePage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) {
      setError("Invalid QR code");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function checkQR() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/qr/${code}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (data?.message === "QR expired") {
            navigate(`/expired/${code}`);
            return;
          }

          if (data?.message === "QR not activated") {
            setLoading(false);
            return;
          }

          throw new Error(data?.message || "Failed to validate QR");
        }

        navigate(`/emergency/${code}`);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Server unreachable");
          setLoading(false);
        }
      }
    }

    checkQR();

    return () => controller.abort();
  }, [code, navigate]);

  if (loading) return <h2>Checking QR status...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div>
      <h1>Activate QR</h1>
      <p>QR Code: {code}</p>
      <p>Please complete activation.</p>
    </div>
  );
}