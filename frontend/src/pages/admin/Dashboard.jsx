import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

const buildUrl = (path) => `${API_BASE}/api${path}`;

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    mobile: "",
    quantity: ""
  });

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [ordersRes, inventoryRes] = await Promise.all([
        fetch(buildUrl("/admin/orders"), { credentials: "include" }),
        fetch(buildUrl("/admin/inventory"), { credentials: "include" })
      ]);

      if (ordersRes.status === 401) {
        window.location.replace("/admin-login");
        return;
      }

      if (!ordersRes.ok || !inventoryRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const ordersData = await ordersRes.json();
      const inventoryData = await inventoryRes.json();

      setOrders(Array.isArray(ordersData.data) ? ordersData.data : []);
      setInventory(Array.isArray(inventoryData.data) ? inventoryData.data : []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================
     CREATE ORDER
  ========================= */
  async function handleCreateOrder() {
    const { customer_name, mobile, quantity } = orderForm;

    if (!customer_name.trim() || !mobile.trim() || !quantity) {
      alert("All fields required");
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);

      const res = await fetch(buildUrl("/admin/orders"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customer_name.trim(),
          mobile: mobile.trim(),
          quantity: Number(quantity)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Order creation failed");
      }

      setOrderForm({
        customer_name: "",
        mobile: "",
        quantity: ""
      });

      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================
     STATS CALCULATION
  ========================= */
  const total = inventory.length;
  const active = inventory.filter(i => i.status === "active").length;
  const inactive = inventory.filter(i => i.status === "inactive").length;
  const expired = inventory.filter(i => i.status === "expired").length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-container">
          <h2>Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-container">

        <h1 className="dashboard-title">
          Operational Overview
        </h1>

        {/* STATS ROW */}
        <div className="stats-row">
          <StatCard title="Total QR Tags" value={total} />
          <StatCard title="Active Tags" value={active} />
          <StatCard title="Inactive Tags" value={inactive} />
          <StatCard title="Expired Tags" value={expired} />
        </div>

        {/* MIDDLE SECTION */}
        <div className="middle-section">

          {/* ORDER FORM */}
          <div className="order-box">
            <h2>Tag Orders</h2>

            <input
              className="form-input"
              placeholder="Customer Name"
              value={orderForm.customer_name}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  customer_name: e.target.value
                })
              }
            />

            <input
              className="form-input"
              placeholder="Mobile"
              value={orderForm.mobile}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  mobile: e.target.value
                })
              }
            />

            <input
              className="form-input"
              type="number"
              placeholder="Quantity"
              value={orderForm.quantity}
              onChange={(e) =>
                setOrderForm({
                  ...orderForm,
                  quantity: e.target.value
                })
              }
            />

            <button
              className="primary-btn"
              onClick={handleCreateOrder}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </div>

          {/* GRAPH SECTION */}
          <div className="graph-box">
            <h2>QR Activation Graph</h2>
            <div className="graph-placeholder">
              Graph Coming Soon
            </div>
          </div>

        </div>

        {/* RECENT ORDERS TABLE */}
        <div>
          <h2>Recent Orders</h2>

          <table className="orders-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Date</th>
                <th>Ordered</th>
                <th>Fulfilled</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6">No orders found</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.customer_name}</td>
                    <td>{o.mobile}</td>
                    <td>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>{o.quantity_ordered}</td>
                    <td>{o.quantity_fulfilled}</td>
                    <td className={`status-${o.status}`}>
                      {o.status}
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

/* =========================
   STAT CARD
========================= */
function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}