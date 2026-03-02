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

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      // backend returns array directly
      setTags(data || []);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      setTags([]);
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>
        <div style={styles.headerCard}>
          <h1 style={styles.title}>QR Tag Inventory</h1>
        </div>

        <div style={styles.card}>
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
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td>{tag.qr_code}</td>
                  <td>{tag.batch_name}</td>
                  <td>{tag.status}</td>
                  <td>
                    {tag.activated_at
                      ? new Date(tag.activated_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
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
  headerCard: {
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "16px",
  },
  title: {
    margin: 0,
    color: "white",
  },
  card: {
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },
};