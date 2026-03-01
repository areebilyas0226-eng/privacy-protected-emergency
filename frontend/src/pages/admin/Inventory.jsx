import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
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
     DOWNLOAD QR PDF (Stable)
  ========================= */
  function downloadQR(qr) {
    try {
      const doc = new jsPDF();
      const qrUrl = `${PUBLIC_URL}/q/${qr}`;

      // Create hidden canvas
      const canvas = document.createElement("canvas");

      const qrInstance = new QRCodeCanvas({
        value: qrUrl,
        size: 300
      });

      // Render QR into canvas
      const temp = document.createElement("div");
      document.body.appendChild(temp);

      import("react-dom/client").then(({ createRoot }) => {
        const root = createRoot(temp);
        root.render(qrInstance);

        setTimeout(() => {
          const generatedCanvas = temp.querySelector("canvas");
          if (!generatedCanvas) return;

          const imgData = generatedCanvas.toDataURL("image/png");

          doc.setFontSize(12);
          doc.text("QR Code", 20, 20);
          doc.text(qrUrl, 20, 30);
          doc.addImage(imgData, "PNG", 20, 40, 160, 160);

          doc.save(`${qr}-qr.pdf`);

          root.unmount();
          document.body.removeChild(temp);
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
                  <QRCodeCanvas
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