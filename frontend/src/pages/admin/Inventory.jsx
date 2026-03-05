import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Inventory() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/inventory`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTags([]);
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.heading}>QR Tag Inventory</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>QR Code</th>
                <th style={styles.th}>Batch</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Activated At</th>
              </tr>
            </thead>

            <tbody>
              {tags.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.empty}>
                    No inventory found
                  </td>
                </tr>
              ) : (
                tags.map((tag, index) => (
                  <tr key={tag?.id || index}>
                    <td style={styles.qr}>{tag?.qr_code || "-"}</td>
                    <td style={styles.td}>{tag?.batch_name || "-"}</td>
                    <td style={styles.td}>{tag?.status || "-"}</td>
                    <td style={styles.td}>
                      {tag?.activated_at
                        ? new Date(tag.activated_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  card: {
    background: "transparent",
    padding: "25px",
    borderRadius: "14px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  heading: {
    marginBottom: "20px",
    color: "#000",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    color: "#000",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid rgba(0,0,0,0.2)",
    fontWeight: "600",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },

  qr: {
    padding: "12px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },

  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#000",
  },
};