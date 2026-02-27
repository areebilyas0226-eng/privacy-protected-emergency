import { useEffect, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_BASE is not defined");
}

const buildUrl = (path) => `${API_BASE}/api${path}`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    mobile: "",
    quantity: ""
  });

  const [batchForm, setBatchForm] = useState({
    batch_name: "",
    agent_name: "",
    quantity: ""
  });

  /* =========================
     SAFE API WRAPPER
  ========================= */
  async function apiFetch(path, options = {}) {
    const res = await fetch(buildUrl(path), {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });

    if (res.status === 401) {
      window.location.replace("/admin-login");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }

    return data;
  }

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersRes, batchesRes, inventoryRes] = await Promise.all([
        apiFetch("/admin/orders"),
        apiFetch("/admin/batches"),
        apiFetch("/admin/inventory")
      ]);

      setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : []);
      setBatches(Array.isArray(batchesRes?.data) ? batchesRes.data : []);
      setInventory(Array.isArray(inventoryRes?.data) ? inventoryRes.data : []);
    } catch (err) {
      setError(err.message);
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

    if (!customer_name || !mobile || !quantity) {
      alert("All fields required");
      return;
    }

    try {
      const res = await apiFetch("/admin/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_name,
          mobile,
          quantity: Number(quantity)
        })
      });

      setOrderForm({ customer_name: "", mobile: "", quantity: "" });

      if (res?.data) {
        setOrders((prev) => [res.data, ...prev]);
      } else {
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  /* =========================
     GENERATE BATCH
  ========================= */
  async function handleGenerateBatch() {
    const { batch_name, agent_name, quantity } = batchForm;

    if (!batch_name || !quantity) {
      alert("Batch name and quantity required");
      return;
    }

    try {
      const res = await apiFetch("/admin/generate-batch", {
        method: "POST",
        body: JSON.stringify({
          batch_name,
          agent_name,
          quantity: Number(quantity)
        })
      });

      setBatchForm({ batch_name: "", agent_name: "", quantity: "" });

      if (res?.data) {
        setBatches((prev) => [res.data, ...prev]);
      } else {
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;
  if (error) return <h2 style={{ padding: 40, color: "red" }}>{error}</h2>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>

      <div style={{ marginBottom: 30 }}>
        <button onClick={() => setActiveTab("orders")}>Tag Orders</button>
        <button onClick={() => setActiveTab("batch")}>Generate QR Batch</button>
        <button onClick={() => setActiveTab("inventory")}>QR Inventory</button>
      </div>

      {activeTab === "orders" && (
        <div>
          <h2>Create Order</h2>

          <input
            placeholder="Customer / Agent Name"
            value={orderForm.customer_name}
            onChange={(e) =>
              setOrderForm({ ...orderForm, customer_name: e.target.value })
            }
          />
          <input
            placeholder="Mobile"
            value={orderForm.mobile}
            onChange={(e) =>
              setOrderForm({ ...orderForm, mobile: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Quantity"
            value={orderForm.quantity}
            onChange={(e) =>
              setOrderForm({ ...orderForm, quantity: e.target.value })
            }
          />

          <button onClick={handleCreateOrder}>Place Order</button>

          <h3 style={{ marginTop: 40 }}>Recent Orders</h3>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Ordered</th>
                <th>Fulfilled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="5">No orders found</td></tr>
              ) : (
                orders.map((o, idx) => (
                  <tr key={o.id ?? idx}>
                    <td>{o.customer_name}</td>
                    <td>{o.mobile}</td>
                    <td>{o.quantity_ordered}</td>
                    <td>{o.quantity_fulfilled}</td>
                    <td>{o.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "batch" && (
        <div>
          <h2>Generate QR Batch</h2>

          <input
            placeholder="Batch Name"
            value={batchForm.batch_name}
            onChange={(e) =>
              setBatchForm({ ...batchForm, batch_name: e.target.value })
            }
          />
          <input
            placeholder="Agent Name"
            value={batchForm.agent_name}
            onChange={(e) =>
              setBatchForm({ ...batchForm, agent_name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Quantity"
            value={batchForm.quantity}
            onChange={(e) =>
              setBatchForm({ ...batchForm, quantity: e.target.value })
            }
          />

          <button onClick={handleGenerateBatch}>Generate</button>

          <table border="1" cellPadding="8" style={{ marginTop: 40 }}>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Agent</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr><td colSpan="3">No batches found</td></tr>
              ) : (
                batches.map((b, idx) => (
                  <tr key={b.id ?? idx}>
                    <td>{b.batch_name}</td>
                    <td>{b.agent_name || "-"}</td>
                    <td>{b.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "inventory" && (
        <div>
          <h2>QR Inventory</h2>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>QR Code</th>
                <th>Batch</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan="4">No inventory found</td></tr>
              ) : (
                inventory.map((i, idx) => (
                  <tr key={i.qr_code ?? idx}>
                    <td>{i.qr_code}</td>
                    <td>{i.batch_name || "-"}</td>
                    <td>{i.status}</td>
                    <td>
                      <a
                        href={`/activate/${i.qr_code}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}