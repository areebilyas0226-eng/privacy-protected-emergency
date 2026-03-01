export default function Topbar() {
  return (
    <div style={styles.topbar}>
      <h2>Admin Panel</h2>
    </div>
  );
}

const styles = {
  topbar: {
    padding: 20,
    borderBottom: "1px solid #e5e7eb",
    background: "white"
  }
};