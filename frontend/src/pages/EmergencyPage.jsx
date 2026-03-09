import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EmergencyPage() {

const { code } = useParams();
const navigate = useNavigate();

const [data,setData] = useState(null);
const [error,setError] = useState("");
const [loading,setLoading] = useState(true);
const [calling,setCalling] = useState(false);

useEffect(()=>{

async function fetchData(){

try{

const res = await fetch(`${API_BASE}/api/emergency/${code}`);

const result = await res.json();

if(res.status === 403 && result.message === "QR not activated"){
navigate(`/activate/${code}`);
return;
}

if(res.status === 403 && result.status === "expired"){
navigate(`/subscribe/${code}`);
return;
}

if(!res.ok){
throw new Error(result.message || "Failed to load emergency data");
}

setData(result);

}catch(err){
setError(err.message);
}finally{
setLoading(false);
}

}

fetchData();

},[code,navigate]);

async function handleCallOwner(){

if(!data?.owner_mobile){
alert("Owner mobile unavailable");
return;
}

try{

setCalling(true);

window.location.href = `tel:${data.owner_mobile}`;

}catch{
alert("Call failed");
}finally{
setCalling(false);
}

}

if(loading){
return <h2 style={{padding:40}}>Loading...</h2>;
}

if(error){
return <div style={{padding:40,color:"red"}}>{error}</div>;
}

return(

<div style={{padding:40}}>

<h1>Emergency Mode</h1>

<p><strong>QR:</strong> {data?.qr_code}</p>
<p><strong>Vehicle:</strong> {data?.vehicle_number}</p>
<p><strong>Model:</strong> {data?.model}</p>

<button
onClick={handleCallOwner}
disabled={calling}
style={{
marginTop:20,
padding:"12px 24px",
backgroundColor:"red",
color:"white",
border:"none",
borderRadius:6
}}
>
{calling ? "Connecting..." : "Call Owner"}
</button>

</div>

);

}