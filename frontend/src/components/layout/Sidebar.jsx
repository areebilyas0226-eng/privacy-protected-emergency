import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>Admin</h3>

      <NavItem to="/admin" label="Dashboard" end />
      <NavItem to="/admin/orders" label="Orders" />
      <NavItem to="/admin/inventory" label="Inventory" />
    </div>
  );
}

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: "block",
        padding: "10px 0",
        color: isActive ? "#60a5fa" : "#e5e7eb",
        textDecoration: "none",
        fontWeight: isActive ? 600 : 400
      })}
    >
      {label}
    </NavLink>
  );
}

const styles = {
  sidebar: {
    width: 220,
    padding: 20,
    background: "#111827",
    minHeight: "100vh",
    color: "white"
  },
  title: {
    marginBottom: 30
  }
};