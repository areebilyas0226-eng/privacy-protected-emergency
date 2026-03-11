import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function PetRegisterPage(){

const { code } = useParams();
const navigate = useNavigate();

const [form,setForm] = useState({
pet_name:"",
pet_type:"",
breed:"",
color:"",
owner_name:"",
owner_mobile:"",
emergency_contact:""
});

const [otp,setOtp] = useState("");
const [otpSent,setOtpSent] = useState(false);
const [loading,setLoading] = useState(false);

function handleChange(e){
setForm({...form,[e.target.name]:e.target.value});
}

/* SEND OTP */

async function sendOTP(){

if(!form.owner_mobile){
alert("Enter mobile number");
return;
}

setLoading(true);

try{

const res = await fetch(`${API_BASE}/api/otp/send`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
mobile:form.owner_mobile
})
});

if(!res.ok) throw new Error();

setOtpSent(true);

}catch{

alert("OTP send failed");

}

setLoading(false);
}

/* VERIFY OTP + REGISTER */

async function verifyAndRegister(){

if(!otp){
alert("Enter OTP");
return;
}

setLoading(true);

try{

/* verify otp */

const verify = await fetch(`${API_BASE}/api/otp/verify`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
mobile:form.owner_mobile,
otp:otp
})
});

if(!verify.ok){
alert("Invalid OTP");
setLoading(false);
return;
}

/* register pet */

const res = await fetch(`${API_BASE}/api/pet/register/${code}`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(form)
});

if(!res.ok) throw new Error();

navigate(`/pet-emergency/${code}`);

}catch{

alert("Registration failed");

}

setLoading(false);
}

return(

<div style={styles.page}>

<div style={styles.card}>

<h2>Pet Registration</h2>

<input name="pet_name" placeholder="Pet Name" onChange={handleChange}/>
<input name="pet_type" placeholder="Pet Type (Dog/Cat)" onChange={handleChange}/>
<input name="breed" placeholder="Breed" onChange={handleChange}/>
<input name="color" placeholder="Color" onChange={handleChange}/>

<input name="owner_name" placeholder="Owner Name" onChange={handleChange}/>
<input name="owner_mobile" placeholder="Owner Mobile" onChange={handleChange}/>
<input name="emergency_contact" placeholder="Emergency Contact" onChange={handleChange}/>

{!otpSent && (

<button onClick={sendOTP}>
{loading ? "Sending OTP..." : "Send OTP"}
</button>

)}

{otpSent && (

<>

<input
placeholder="Enter OTP"
value={otp}
onChange={(e)=>setOtp(e.target.value)}
/>

<button onClick={verifyAndRegister}>
{loading ? "Verifying..." : "Verify & Register"}
</button>

</>

)}

</div>

</div>

);

}

const styles = {

page:{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"linear-gradient(135deg,#3b82f6,#1d4ed8)"
},

card:{
width:"420px",
padding:"35px",
background:"rgba(255,255,255,0.2)",
backdropFilter:"blur(25px)",
borderRadius:"20px",
display:"flex",
flexDirection:"column",
gap:"12px"
}

};