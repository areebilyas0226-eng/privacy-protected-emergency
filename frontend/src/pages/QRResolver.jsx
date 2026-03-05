import { useParams,useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function QRResolver(){

const {code}=useParams();
const navigate=useNavigate();

useEffect(()=>{

async function resolve(){

try{

const res = await fetch(`${API_BASE}/api/qr/${code}`);

if(!res.ok){
navigate(`/expired/${code}`);
return;
}

const data = await res.json();

/* NOT REGISTERED */

if(!data.profiles_id){
navigate(`/register/${code}`);
return;
}

/* INACTIVE */

if(data.status==="inactive"){
navigate(`/activate/${code}`);
return;
}

/* ACTIVE */

if(data.status==="active"){

const now = new Date();
const expiry = new Date(data.expires_at);

if(expiry>now){
navigate(`/emergency/${code}`);
}else{
navigate(`/subscription/${code}`);
}

return;
}

navigate(`/expired/${code}`);

}catch{

navigate(`/expired/${code}`);

}

}

resolve();

},[code,navigate]);

return(
<div style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>
Resolving QR...
</div>
);

}