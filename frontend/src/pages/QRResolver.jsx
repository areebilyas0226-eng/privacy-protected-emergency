import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function QRResolver(){

const { code } = useParams();
const navigate = useNavigate();
const resolved = useRef(false);

useEffect(()=>{

if(!code || resolved.current) return;

resolved.current = true;

async function resolveQR(){

try{

const res = await fetch(`${API_BASE}/api/qr/${code}`);

if(!res.ok){
navigate(`/expired/${code}`,{replace:true});
return;
}

const data = await res.json();

const type = data.qr_type || "vehicle";

/* ROUTES */

const activateRoute =
type === "pet"
? `/pet-activate/${code}`
: `/vehicle-activate/${code}`;

const registerRoute =
type === "pet"
? `/pet-register/${code}`
: `/vehicle-register/${code}`;

const emergencyRoute =
type === "pet"
? `/pet-emergency/${code}`
: `/vehicle-emergency/${code}`;

/* ======================
INACTIVE
====================== */

if(data.status === "inactive"){
navigate(activateRoute,{replace:true});
return;
}

/* ======================
ACTIVATION STARTED
====================== */

if(data.status === "activation_pending"){
navigate(registerRoute,{replace:true});
return;
}

/* ======================
EXPIRED
====================== */

if(data.status === "expired"){
navigate(`/subscription/${code}`,{replace:true});
return;
}

/* ======================
ACTIVE
====================== */

if(data.status === "active"){

const expiry = data.expires_at ? new Date(data.expires_at) : null;
const now = new Date();

if(!expiry){
navigate(emergencyRoute,{replace:true});
return;
}

if(expiry.getTime() > now.getTime()){
navigate(emergencyRoute,{replace:true});
return;
}

navigate(`/subscription/${code}`,{replace:true});
return;

}

/* ======================
FALLBACK
====================== */

navigate(`/expired/${code}`,{replace:true});

}catch(err){

console.error(err);
navigate(`/expired/${code}`,{replace:true});

}

}

resolveQR();

},[code,navigate]);

return(

<div style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"18px"
}}>
Resolving QR...
</div>

);

}