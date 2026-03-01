import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div style={styles.mainArea}>
        
        {/* Top Navigation */}
        <Topbar />

        {/* Page Content */}
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
    backgroundColor: "#0f172a",
  },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111827",
  },

  content: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
  },
};