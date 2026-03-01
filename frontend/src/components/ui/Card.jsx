export default function Card({ children }) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: 25,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  }
};