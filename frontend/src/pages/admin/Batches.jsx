import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function Inventory() {
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
          <h1 style={styles.title}>QR Tag Inventory</h1>
        </div>

        {/* GENERATE SECTION */}
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

        {/* TABLE SECTION */}
        <div style={styles.tableCard}>

          <div style={styles.tableTopBar}>
            <input
              placeholder="Search by code, batch name..."
              style={styles.search}
            />
            <button style={styles.exportBtn}>Export CSV</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>QR Code</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Activated At</th>
                <th>Expires At</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>QR-001</td>
                <td>Batch A</td>
                <td>Active</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>View</td>
              </tr>
            </tbody>
          </table>

          <div style={styles.filterRow}>
            <button style={styles.filterBtn}>Active Tags</button>
            <button style={styles.filterBtn}>Inactive Tags</button>
            <button style={styles.filterBtn}>Expiring 7 Days</button>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

/* =======================
   STYLES (Glass iOS)
======================= */

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
  generateCard: {
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
  tableCard: {
    ...glass,
    padding: "30px",
  },
  tableTopBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  search: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    width: "300px",
  },
  exportBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "#10b981",
    color: "white",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },
  filterRow: {
    marginTop: "20px",
    display: "flex",
    gap: "15px",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid white",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
};