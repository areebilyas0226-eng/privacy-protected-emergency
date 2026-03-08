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

/* inactive → show activate page */

if(data.status === "inactive"){
navigate(`/activate/${code}`,{replace:true});
return;
}

/* activation started → go to register */

if(data.status === "activation_pending"){
navigate(`/register/${code}`,{replace:true});
return;
}

/* active tag */

if(data.status === "active"){

const expiry = data.expires_at ? new Date(data.expires_at) : null;
const now = new Date();

if(!expiry){
navigate(`/emergency/${code}`,{replace:true});
return;
}

if(expiry.getTime() > now.getTime()){
navigate(`/emergency/${code}`,{replace:true});
return;
}

navigate(`/subscription/${code}`,{replace:true});
return;

}

/* fallback */

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