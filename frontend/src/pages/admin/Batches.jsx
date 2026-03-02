import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Inventory() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    const res = await fetch(`${API_BASE}/api/admin/inventory`, {
      credentials: "include",
    });
    const data = await res.json();
    setTags(data);
  }

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>

        <div style={styles.headerCard}>
          <h1 style={styles.title}>QR Tag Inventory</h1>
        </div>

        <div style={styles.tableCard}>
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