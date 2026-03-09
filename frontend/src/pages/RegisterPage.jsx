import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function RegisterPage(){

const { code } = useParams();
const navigate = useNavigate();

const [form,setForm] = useState({
owner_name:"",
mobile:"",
vehicle_name:"",
vehicle_number:"",
blood_group:"",
family_contact:""
});

const [otp,setOtp] = useState("");
const [otpSent,setOtpSent] = useState(false);
const [loading,setLoading] = useState(false);
const [message,setMessage] = useState("");

function handleChange(e){
setForm({...form,[e.target.name]:e.target.value});
}

function validateForm(){

if(!form.owner_name) return "Owner name required";
if(!form.mobile) return "Owner mobile required";
if(!form.vehicle_name) return "Vehicle name required";
if(!form.vehicle_number) return "Vehicle number required";
if(!form.blood_group) return "Blood group required";
if(!form.family_contact) return "Family contact required";

return null;

}

/* SEND OTP */

async function sendOTP(){

const error = validateForm();
if(error){
setMessage(error);
return;
}

setLoading(true);
setMessage("");

try{

const res = await fetch(`${API_BASE}/api/otp/send`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ mobile:form.mobile })
});

const data = await res.json();

if(!res.ok){
throw new Error(data.message || "OTP send failed");
}

setOtpSent(true);
setMessage("OTP sent successfully");

}catch(err){
setMessage(err.message);
}finally{
setLoading(false);
}

}

/* ACTIVATE TAG */

async function activateTag(){

if(!otp){
setMessage("Enter OTP first");
return;
}

setLoading(true);
setMessage("");

try{

/* VERIFY OTP */

const verify = await fetch(`${API_BASE}/api/otp/verify`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
mobile:form.mobile,
otp
})
});

const v = await verify.json();

if(!verify.ok){
throw new Error(v.message || "OTP verification failed");
}

/* CREATE PROFILE */

const profile = await fetch(`${API_BASE}/api/profile/${code}`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(form)
});

const p = await profile.json();

if(!profile.ok){
throw new Error(p.message || "Profile creation failed");
}

/* ACTIVATE QR */

const activate = await fetch(`${API_BASE}/api/tags/activate/${code}`,{
method:"POST"
});

const a = await activate.json().catch(()=>({}));

if(!activate.ok){
throw new Error(a.message || "Activation failed");
}

setMessage("QR Tag Activated Successfully");

setTimeout(()=>{
navigate(`/emergency/${code}`);
},1500);

}catch(err){
setMessage(err.message);
}finally{
setLoading(false);
}

}

return(

<div style={styles.page}>

<div style={styles.card}>

<h2 style={styles.title}>Vehicle Registration</h2>

<input
name="owner_name"
placeholder="Owner Name"
onChange={handleChange}
style={styles.input}
/>

<input
name="mobile"
placeholder="Owner Mobile"
onChange={handleChange}
style={styles.input}
/>

<input
name="vehicle_name"
placeholder="Vehicle Name"
onChange={handleChange}
style={styles.input}
/>

<input
name="vehicle_number"
placeholder="Vehicle Number"
onChange={handleChange}
style={styles.input}
/>

<input
name="blood_group"
placeholder="Blood Group"
onChange={handleChange}
style={styles.input}
/>

<input
name="family_contact"
placeholder="Family Emergency Contact"
onChange={handleChange}
style={styles.input}
/>

{!otpSent && (

<button
onClick={sendOTP}
disabled={loading}
style={styles.button}
>
{loading ? "Sending OTP..." : "Send OTP"}
</button>

)}

{otpSent && (

<>
<input
placeholder="Enter OTP"
value={otp}
onChange={(e)=>setOtp(e.target.value)}
style={styles.input}
/>

<button
onClick={activateTag}
disabled={loading}
style={styles.button}
>
{loading ? "Activating..." : "Activate Tag"}
</button>
</>

)}

{message && <p style={styles.message}>{message}</p>}

</div>

</div>

);

}

const styles={

page:{
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",
padding:"20px"
},

card:{
width:"100%",
maxWidth:"420px",
padding:"30px",
borderRadius:"22px",
backdropFilter:"blur(25px)",
background:"rgba(255,255,255,0.2)",
border:"1px solid rgba(255,255,255,0.3)",
boxShadow:"0 10px 40px rgba(0,0,0,0.25)"
},

title:{
color:"#fff",
marginBottom:"20px",
textAlign:"center"
},

input:{
width:"100%",
padding:"14px",
marginBottom:"12px",
borderRadius:"12px",
border:"none",
background:"rgba(255,255,255,0.95)"
},

button:{
width:"100%",
padding:"14px",
borderRadius:"14px",
border:"none",
background:"#1d4ed8",
color:"#fff",
fontSize:"16px",
cursor:"pointer"
},

message:{
marginTop:"15px",
textAlign:"center",
color:"#fff"
}

};