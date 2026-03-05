import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ActivatePage() {

const { code } = useParams();
const navigate = useNavigate();

const [checking,setChecking] = useState(true);
const [error,setError] = useState("");
const [qrValid,setQrValid] = useState(false);

/* ===============================
Validate QR
=============================== */

useEffect(()=>{

if(!code) return;

async function validateQR(){

try{

const res = await fetch(`${API_BASE}/api/qr/${code}`);

if(!res.ok){
throw new Error("Invalid QR Code");
}

setQrValid(true);

}catch(err){

setError("QR not found or invalid");

}finally{

setChecking(false);

}

}

validateQR();

},[code]);

/* ===============================
Activate Button
=============================== */

function handleActivate(){

if(!qrValid) return;

navigate(`/register/${code}`);

}

/* ===============================
Loading State
=============================== */

if(checking){

return(
<div style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"18px"
}}>
Checking QR...
</div>
);

}

/* ===============================
Invalid QR
=============================== */

if(error){

return(
<div style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
flexDirection:"column"
}}>
<h2 style={{color:"red"}}>{error}</h2>
</div>
);

}

/* ===============================
Main UI
=============================== */

return(

<div style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#f4f4f4"
}}>

<div style={{
width:"420px",
background:"#fff",
padding:"30px",
borderRadius:"10px",
boxShadow:"0 0 10px rgba(0,0,0,0.1)",
textAlign:"center"
}}>

<h2>Activate Emergency Tag</h2>

<p style={{marginTop:"15px",lineHeight:"1.6"}}>

You are about to activate your vehicle emergency tag.
After activation, your emergency details will be accessible
to first responders when this QR code is scanned.

</p>

<p style={{marginTop:"10px",fontSize:"14px",color:"#555"}}>

You will be asked to enter your vehicle number and phone number
on the next step.

</p>

<button
onClick={handleActivate}
style={{
marginTop:"25px",
padding:"12px 24px",
border:"none",
borderRadius:"6px",
background:"#2563eb",
color:"#fff",
fontSize:"16px",
cursor:"pointer"
}}
>
Activate Tag
</button>

<p style={{marginTop:"20px",fontSize:"14px"}}>
Need help? WhatsApp Support
</p>

</div>

</div>

);

}