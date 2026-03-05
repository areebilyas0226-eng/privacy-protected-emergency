import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Inventory() {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.qr_code?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter
      ? tag.status === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.heading}>QR Tag Inventory</h2>

          <div style={styles.controls}>
            <input
              placeholder="Search QR Code"
              style={styles.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={styles.filter}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>QR Code</th>
                <th style={styles.th}>Batch</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Activated At</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.empty}>
                    No inventory found
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag, index) => (
                  <tr key={tag?.id || index}>
                    <td style={styles.qr}>{tag?.qr_code || "-"}</td>
                    <td style={styles.td}>{tag?.batch_name || "-"}</td>
                    <td style={styles.td}>{tag?.status || "-"}</td>
                    <td style={styles.td}>
                      {tag?.activated_at
                        ? new Date(tag.activated_at).toLocaleDateString()
                        : "-"}
                    </td>

                    <td style={styles.td}>
                      <button style={styles.extendBtn}>
                        Extend
                      </button>
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

  controls: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  search: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "250px",
    background: "rgba(255,255,255,0.6)",
  },

  filter: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "rgba(255,255,255,0.6)",
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

  extendBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#22c55e",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#000",
  },
};