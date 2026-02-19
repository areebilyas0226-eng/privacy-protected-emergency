import { useParams } from "react-router-dom";

export default function ExpiredPage() {
  const { code } = useParams();

  return (
    <div>
      <h1>Subscription Expired</h1>
      <p>QR Code: {code}</p>
    </div>
  );
}