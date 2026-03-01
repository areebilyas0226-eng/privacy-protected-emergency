import DashboardLayout from "../../components/layout/DashboardLayout";

export default function Batches() {
  return (
    <DashboardLayout>
      <GlassCard>
        <h1>Inventory</h1>
        <p>Manage QR tag batches and stock levels.</p>
      </GlassCard>
    </DashboardLayout>
  );
}

function GlassCard({ children }) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    padding: 30,
    borderRadius: 20,
    backdropFilter: "blur(25px)",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
  }
};