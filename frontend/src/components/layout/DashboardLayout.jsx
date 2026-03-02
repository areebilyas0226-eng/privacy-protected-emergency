import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <div style={styles.main}>
        <Topbar />

        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #4f46e5, #06b6d4, #9333ea)",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  main: {
    flex: 1,
    padding: "30px",
  },
  content: {
    marginTop: "20px",
  },
};