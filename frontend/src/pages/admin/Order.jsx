import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Orders() {
  const [form, setForm] = useState({
    batch_name: "",
    agent_name: "",
    quantity: "",
  });

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  }

  async function handleCreateOrder() {
    try {
      await fetch(`${API_BASE}/api/admin/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      setForm({ batch_name: "", agent_name: "", quantity: "" });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Create Order</h2>

          <div style={styles.formGrid}>
            <input
              placeholder="Batch Name"
              style={styles.input}
              value={form.batch_name}
              onChange={(e) =>
                setForm({ ...form, batch_name: e.target.value })
              }
            />
            <input
              placeholder="Agent Name"
              style={styles.input}
              value={form.agent_name}
              onChange={(e) =>
                setForm({ ...form, agent_name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Quantity"
              style={styles.input}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
            />
          </div>

          <button style={styles.button} onClick={handleCreateOrder}>
            Create Order
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>Order History</h2>

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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.empty}>
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order?.id || index}>
                    <td>{index + 1}</td>
                    <td>{order?.batch_name || "-"}</td>
                    <td>{order?.agent_name || "-"}</td>
                    <td>{order?.quantity_ordered || "-"}</td>
                    <td>{order?.status || "-"}</td>
                    <td>
                      {order?.created_at
                        ? new Date(order.created_at).toLocaleDateString()
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginBottom: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    cursor: "pointer",
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