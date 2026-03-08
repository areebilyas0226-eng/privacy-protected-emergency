import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ActivatePage(){

const { code } = useParams();
const navigate = useNavigate();

const [loading,setLoading] = useState(false);
const [error,setError] = useState("");

async function handleActivate(){

try{

setLoading(true);

const res = await fetch(`${API_BASE}/api/tags/activate/${code}`,{
method:"POST"
});

if(!res.ok){
throw new Error("Activation failed");
}

/* redirect to registration */

navigate(`/register/${code}`);

}catch(err){

setError("Activation failed");

}finally{

setLoading(false);

}

}

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
textAlign:"center",
boxShadow:"0 0 10px rgba(0,0,0,0.1)"
}}>

<h2>Activate Emergency Tag</h2>

<p style={{marginTop:15,lineHeight:1.6}}>
You are about to activate your emergency QR tag.
Please activate your tag and complete registration.
</p>

<button
onClick={handleActivate}
disabled={loading}
style={{
marginTop:25,
padding:"12px 24px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
{loading ? "Activating..." : "Activate Tag"}
</button>

{error && <p style={{color:"red"}}>{error}</p>}

</div>

</div>

);

}