export default function Button({ children, onClick }) {
  return (
    <button onClick={onClick} style={styles.btn}>
      {children}
    </button>
  );
}

const styles = {
  btn: {
    padding: "10px 18px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  }
};