import DashboardLayout from "../../components/layout/DashboardLayout";

export default function Inventory() {
  return (
    <DashboardLayout>
      <div style={styles.wrapper}>

        <div style={styles.headerCard}>
          <h1 style={styles.title}>Inventory</h1>
          <p style={styles.subtitle}>
            Manage QR tag batches and stock levels
          </p>
        </div>

        <div style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>Stock Overview</h2>
          <p style={styles.placeholder}>
            Inventory table and controls will appear here.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}

const glass = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  headerCard: {
    ...glass,
    padding: "30px 40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    margin: 0,
    color: "white",
  },
  subtitle: {
    marginTop: "8px",
    opacity: 0.8,
    color: "white",
  },
  contentCard: {
    ...glass,
    padding: "40px",
    minHeight: "400px",
  },
  sectionTitle: {
    color: "white",
    marginBottom: "20px",
  },
  placeholder: {
    color: "white",
    opacity: 0.7,
  },
};