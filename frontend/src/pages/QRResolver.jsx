import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function QRResolver() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function resolveQR() {
      try {
        const res = await fetch(`${API_BASE}/api/qr/${code}`);

        if (!res.ok) {
          navigate(`/expired/${code}`);
          return;
        }

        const data = await res.json();

        if (data.status === "inactive") {
          navigate(`/activate/${code}`);
        }
        else if (data.status === "active") {
          navigate(`/emergency/${code}`);
        }
        else if (data.status === "expired") {
          navigate(`/expired/${code}`);
        }
        else {
          navigate(`/activate/${code}`);
        }

      } catch {
        navigate(`/expired/${code}`);
      }
    }

    resolveQR();
  }, [code, navigate]);

  return (
    <div style={{ padding: 40 }}>
      Resolving QR...
    </div>
  );
}