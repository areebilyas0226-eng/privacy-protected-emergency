export default function Card({ children }) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: "transparent",
    padding: 25,
    borderRadius: 12,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)"
  }
};