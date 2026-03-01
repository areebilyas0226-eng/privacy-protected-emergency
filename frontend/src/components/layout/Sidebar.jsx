export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h3 style={{ marginBottom: 20 }}>Admin</h3>
      <p>Dashboard</p>
      <p>Orders</p>
      <p>Inventory</p>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 220,
    padding: 20,
    background: "#111827",
    color: "white",
    minHeight: "100vh"
  }
};