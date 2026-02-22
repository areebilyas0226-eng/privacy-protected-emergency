import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [qrs, setQrs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [batchQty, setBatchQty] = useState("");
  const [subscriptionCode, setSubscriptionCode] = useState("");
  const [subscriptionYears, setSubscriptionYears] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("");

  const LIMIT = 50;

  async function apiFetch(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
        ...options.headers
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function fetchStats() {
    const data = await apiFetch("/admin/stats");
    setStats(data);
  }

  async function fetchQrs(pageNumber = 1) {
    const data = await apiFetch(`/admin/qrs?page=${pageNumber}`);
    setQrs(data.data || []);
    setTotal(data.total || 0);
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);
        await fetchStats();
        await fetchQrs(page);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [page]);

  async function handleGenerateBatch() {
    if (!batchQty) return alert("Enter quantity");

    try {
      await apiFetch("/admin/generate-batch", {
        method: "POST",
        body: JSON.stringify({ quantity: Number(batchQty) })
      });

      alert("Batch generated");
      setBatchQty("");
      fetchStats();
      fetchQrs(page);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleExtendSubscription() {
    if (!subscriptionCode || !subscriptionYears || !subscriptionPrice)
      return alert("All fields required");

    try {
      await apiFetch(`/admin/subscription/${subscriptionCode.toUpperCase()}`, {
        method: "POST",
        body: JSON.stringify({
          years: Number(subscriptionYears),
          price_paid: Number(subscriptionPrice)
        })
      });

      alert("Subscription updated");

      setSubscriptionCode("");
      setSubscriptionYears("");
      setSubscriptionPrice("");

      fetchStats();
      fetchQrs(page);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading Dashboard...</h2>;
  if (error) return <h2 style={{ padding: 40, color: "red" }}>{error}</h2>;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: 40 }}>
        <h2>System Stats</h2>
        <p>Active: {stats?.active}</p>
        <p>Inactive: {stats?.inactive}</p>
        <p>Expired: {stats?.expired}</p>
        <p>Total QR: {stats?.total}</p>
        <p>Total Revenue: ₹{stats?.total_revenue}</p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2>Generate QR Batch</h2>
        <input
          type="number"
          placeholder="Quantity"
          value={batchQty}
          onChange={(e) => setBatchQty(e.target.value)}
        />
        <button onClick={handleGenerateBatch}>
          Generate
        </button>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2>Activate / Extend Subscription</h2>

        <input
          placeholder="QR Code"
          value={subscriptionCode}
          onChange={(e) => setSubscriptionCode(e.target.value)}
        />

        <input
          type="number"
          placeholder="Years"
          value={subscriptionYears}
          onChange={(e) => setSubscriptionYears(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount Paid"
          value={subscriptionPrice}
          onChange={(e) => setSubscriptionPrice(e.target.value)}
        />

        <button onClick={handleExtendSubscription}>
          Update Subscription
        </button>
      </div>

      <div>
        <h2>QR Codes</h2>

        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>QR Code</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Revenue</th>
              <th>Expires</th>
              <th>Vehicle</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {qrs.map((qr) => (
              <tr key={qr.qr_code}>
                <td>{qr.qr_code}</td>
                <td>{qr.status}</td>
                <td>{qr.plan_type}</td>
                <td>₹{qr.price_paid}</td>
                <td>
                  {qr.expires_at
                    ? new Date(qr.expires_at).toLocaleDateString()
                    : "-"}
                </td>
                <td>{qr.vehicle_number || "-"}</td>
                <td>{qr.owner_mobile || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20 }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>

          <span style={{ margin: "0 20px" }}>
            Page {page} / {totalPages || 1}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}