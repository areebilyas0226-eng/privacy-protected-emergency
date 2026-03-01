import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
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
    backgroundSize: "400% 400%",
    animation: "gradientMove 15s ease infinite",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  main: {
    flex: 1,
    padding: "40px",
  },
  content: {
    marginTop: "0px",
  },
};