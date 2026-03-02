import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function Orders() {
  const [form, setForm] = useState({
    batchName: "",
    agentName: "",
    quantity: "",
  });

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>

        {/* HEADER */}
        <div style={styles.headerCard}>
          <h1 style={styles.title}>Orders</h1>
          <p style={styles.subtitle}>
            Create and manage QR tag orders
          </p>
        </div>

        {/* GENERATE ORDER SECTION */}
        <div style={styles.generateCard}>
          <h2 style={styles.sectionTitle}>Generate QR Tags</h2>

          <div style={styles.formGrid}>
            <input
              placeholder="Batch Name"
              style={styles.input}
              value={form.batchName}
              onChange={(e) =>
                setForm({ ...form, batchName: e.target.value })
              }
            />
            <input
              placeholder="Agent Name"
              style={styles.input}
              value={form.agentName}
              onChange={(e) =>
                setForm({ ...form, agentName: e.target.value })
              }
            />
            <input
              placeholder="Quantity"
              type="number"
              style={styles.input}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
            />
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.primaryBtn}>Generate</button>
            <button style={styles.secondaryBtn}>Download PDF</button>
          </div>
        </div>

        {/* ORDER TABLE */}
        <div style={styles.tableCard}>
          <h2 style={styles.sectionTitle}>Order History</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Batch</th>
                <th>Agent</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Batch A</td>
                <td>Agent X</td>
                <td>100</td>
                <td>Generated</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}

/* =========================
   Glass Styles
========================= */

const glass = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  headerCard: {
    ...glass,
    padding: "25px 35px",
  },
  title: {
    margin: 0,
    color: "white",
  },
  subtitle: {
    color: "white",
    opacity: 0.8,
  },
  generateCard: {
    ...glass,
    padding: "30px",
  },
  tableCard: {
    ...glass,
    padding: "30px",
  },
  sectionTitle: {
    color: "white",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  buttonRow: {
    display: "flex",
    gap: "15px",
  },
  primaryBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#6366f1,#06b6d4)",
    color: "white",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "1px solid white",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },
};