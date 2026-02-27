import { useEffect, useState, useRef } from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

const buildUrl = (path) => `${API_BASE}/api${path}`;

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);

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
    } catch (err) {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  /* =========================
     BARCODE RENDERING
  ========================= */
  useEffect(() => {
    if (selectedQR && canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, selectedQR, {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: true
        });
      } catch {
        setError("Failed to generate barcode");
      }
    }
  }, [selectedQR]);

  function handleView(qr) {
    setSelectedQR(qr);
  }

  function downloadPDF(qr) {
    try {
      const doc = new jsPDF();

      const canvas = document.createElement("canvas");

      JsBarcode(canvas, qr, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true
      });

      const imgData = canvas.toDataURL("image/png");

      doc.setFontSize(14);
      doc.text("QR Barcode", 20, 20);
      doc.addImage(imgData, "PNG", 20, 30, 170, 50);

      doc.save(`${qr}-barcode.pdf`);
    } catch {
      alert("Failed to download PDF");
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="4">No inventory found</td>
            </tr>
          ) : (
            inventory.map((item, index) => (
              <tr key={item.qr_code ?? index}>
                <td>{item.qr_code}</td>
                <td>{item.batch_name || "-"}</td>
                <td>{item.status}</td>
                <td>
                  <button onClick={() => handleView(item.qr_code)}>
                    View Barcode
                  </button>

                  <button
                    onClick={() => downloadPDF(item.qr_code)}
                    style={{ marginLeft: 10 }}
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedQR && (
        <div style={{ marginTop: 40 }}>
          <h3>Barcode Preview</h3>
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}