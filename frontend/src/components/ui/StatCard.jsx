export default function StatCard({ title, value }) {
  return (
    <div style={styles.card}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

const styles = {
  card: {
    flex: 1,
    padding: 20,
    background: "#f3f4f6",
    borderRadius: 12
  }
};