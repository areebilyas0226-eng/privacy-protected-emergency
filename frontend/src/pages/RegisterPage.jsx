import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function RegisterPage(){

const { code } = useParams();
const navigate = useNavigate();

const [owner,setOwner] = useState("");
const [phone,setPhone] = useState("");
const [vehicle,setVehicle] = useState("");
const [vehicleNumber,setVehicleNumber] = useState("");
const [blood,setBlood] = useState("");
const [emergency,setEmergency] = useState("");

async function handleRegister(){

const res = await fetch(`${API_BASE}/api/profiles/register`,{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({
code,
owner,
phone,
vehicle,
vehicleNumber,
blood,
emergency
})
});

if(res.ok){

/* profile saved → tag active */

navigate(`/emergency/${code}`);

}

}

return(

<div style={{padding:40,maxWidth:400}}>

<h2>Vehicle Registration</h2>

<input placeholder="Owner Name" value={owner} onChange={e=>setOwner(e.target.value)} />
<input placeholder="Mobile Number" value={phone} onChange={e=>setPhone(e.target.value)} />
<input placeholder="Vehicle Name" value={vehicle} onChange={e=>setVehicle(e.target.value)} />
<input placeholder="Vehicle Number" value={vehicleNumber} onChange={e=>setVehicleNumber(e.target.value)} />
<input placeholder="Blood Group" value={blood} onChange={e=>setBlood(e.target.value)} />
<input placeholder="Emergency Contact" value={emergency} onChange={e=>setEmergency(e.target.value)} />

<button onClick={handleRegister} style={{marginTop:20}}>
Submit
</button>

</div>

);

}