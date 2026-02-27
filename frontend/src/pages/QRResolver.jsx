import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

export default function QRResolver() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      setError("Invalid QR code");
      return;
    }

    const controller = new AbortController();

    async function resolveQR() {
      try {
        const res = await fetch(
          `${API_BASE}/api/qr/${code}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));

        if (res.status === 404) {
          setError("QR not found");
          return;
        }

        if (res.status === 403) {
          if (data?.message === "QR expired") {
            navigate(`/expired/${code}`);
          } else {
            navigate(`/activate/${code}`);
          }
          return;
        }

        if (!res.ok) {
          throw new Error(data?.message || "Failed to verify QR");
        }

        // Active QR
        navigate(`/emergency/${code}`);

      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to verify QR");
        }
      }
    }

    resolveQR();
    return () => controller.abort();
  }, [code, navigate]);

  if (error) {
    return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  }

  return <div style={{ padding: 40 }}>Checking QR status...</div>;
}