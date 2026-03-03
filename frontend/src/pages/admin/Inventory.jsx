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
                <th>QR Code</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Activated At</th>
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
                    <td>{tag?.qr_code || "-"}</td>
                    <td>{tag?.batch_name || "-"}</td>
                    <td>{tag?.status || "-"}</td>
                    <td>
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
    background: "rgba(255,255,255,0.9)",
    padding: "25px",
    borderRadius: "14px",
  },
  heading: {
    marginBottom: "15px",
    color: "#111",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#555",
  },
};