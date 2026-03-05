import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function QRResolver() {

const { code } = useParams();
const navigate = useNavigate();
const resolved = useRef(false);

useEffect(() => {

if (!code || resolved.current) return;

resolved.current = true;

async function resolveQR() {

try {

const res = await fetch(`${API_BASE}/api/qr/${code}`);

if (!res.ok) {
navigate(`/expired/${code}`, { replace: true });
return;
}

const data = await res.json();

/* ---------------------------
TAG NOT REGISTERED
----------------------------*/

if (!data.profile_id && !data.owner_name) {
navigate(`/register/${code}`, { replace: true });
return;
}

/* ---------------------------
TAG REGISTERED BUT NOT ACTIVE
----------------------------*/

if (data.status === "inactive") {
navigate(`/activate/${code}`, { replace: true });
return;
}

/* ---------------------------
ACTIVE TAG
----------------------------*/

if (data.status === "active") {

const expiry = data.expires_at ? new Date(data.expires_at) : null;
const now = new Date();

/* No expiry stored */
if (!expiry) {
navigate(`/emergency/${code}`, { replace: true });
return;
}

/* Valid subscription */
if (expiry.getTime() > now.getTime()) {
navigate(`/emergency/${code}`, { replace: true });
return;
}

/* Expired subscription */
navigate(`/subscription/${code}`, { replace: true });
return;

}

/* ---------------------------
UNKNOWN STATE
----------------------------*/

navigate(`/expired/${code}`, { replace: true });

} catch (err) {

console.error("QR Resolve Error:", err);
navigate(`/expired/${code}`, { replace: true });

}

}

resolveQR();

}, [code, navigate]);

return (
<div
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "18px",
fontWeight: "500"
}}
>
Resolving QR...
</div>
);

}