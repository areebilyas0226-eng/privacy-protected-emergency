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
    const res = await fetch(`${API_BASE}/api/admin/orders`, {
      credentials: "include",
    });
    const data = await res.json();
    setOrders(data);
  }

  async function handleCreateOrder() {
    await fetch(`${API_BASE}/api/admin/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    setForm({ batch_name: "", agent_name: "", quantity: "" });
    fetchOrders();
  }

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>

        <div style={styles.headerCard}>
          <h1 style={styles.title}>Orders</h1>
        </div>

        <div style={styles.generateCard}>
          <h2 style={styles.sectionTitle}>Generate QR Tags</h2>

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

          <button style={styles.primaryBtn} onClick={handleCreateOrder}>
            Create Order
          </button>
        </div>

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
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.batch_name}</td>
                  <td>{order.agent_name}</td>
                  <td>{order.quantity_ordered}</td>
                  <td>{order.status}</td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString()}
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