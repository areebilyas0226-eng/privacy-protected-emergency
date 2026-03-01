import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";

const API_BASE = import.meta.env.VITE_API_URL;
const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL;

if (!API_BASE) throw new Error("VITE_API_URL is not defined");
if (!PUBLIC_URL) throw new Error("VITE_PUBLIC_URL is not defined");

const buildUrl = (path) => `${API_BASE}/api${path}`;

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD INVENTORY
  ========================= */
  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(buildUrl("/admin/inventory"), {
        credentials: "include"
      });

      if (res.status === 401) {
        window.location.replace("/admin-login");
        return;
      }

      const data = await res.json();
      setInventory(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  /* =========================
     GENERATE QR PDF (DOM-INDEPENDENT)
  ========================= */
  function downloadQR(qr) {
    try {
      const doc = new jsPDF();
      const qrUrl = `${PUBLIC_URL}/q/${qr}`;

      // Create temporary canvas
      const canvas = document.createElement("canvas");
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      // Render QR to temporary element
      const tempDiv = document.createElement("div");
      document.body.appendChild(tempDiv);

      const qrElement = (
        <QRCodeSVG value={qrUrl} size={size} />
      );

      // Render QR to DOM temporarily
      import("react-dom").then(({ createRoot }) => {
        const root = createRoot(tempDiv);
        root.render(qrElement);

        setTimeout(() => {
          const svg = tempDiv.querySelector("svg");
          if (!svg) return;

          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();

          img.onload = function () {
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL("image/png");

            doc.setFontSize(12);
            doc.text("QR Code", 20, 20);
            doc.text(qrUrl, 20, 30);
            doc.addImage(imgData, "PNG", 20, 40, 160, 160);

            doc.save(`${qr}-qr.pdf`);

            root.unmount();
            document.body.removeChild(tempDiv);
          };

          img.src =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(svgData);
        }, 100);
      });

    } catch {
      alert("Failed to download QR");
    }
  }

  /* =========================
     UI STATES
  ========================= */
  if (loading) return <h2>Loading inventory...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div>
      <h2>QR Inventory</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>QR Code</th>
            <th>Batch</th>
            <th>Status</th>
            <th>View QR Code</th>
            <th>Download</th>
          </tr>
        </thead>

        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="5">No inventory found</td>
            </tr>
          ) : (
            inventory.map((item, index) => (
              <tr key={item.qr_code ?? index}>
                <td>{item.qr_code}</td>
                <td>{item.batch_name || "-"}</td>
                <td>{item.status}</td>

                <td>
                  <QRCodeSVG
                    value={`${PUBLIC_URL}/q/${item.qr_code}`}
                    size={80}
                  />
                </td>

                <td>
                  <button onClick={() => downloadQR(item.qr_code)}>
                    Download PDF
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}