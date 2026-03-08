import { useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function RegisterPage(){

const { code } = useParams();

const [form,setForm] = useState({
owner_name:"",
mobile:"",
vehicle_name:"",
vehicle_number:"",
blood_group:"",
emergency_contact:""
});

const [loading,setLoading] = useState(false);
const [message,setMessage] = useState("");

function handleChange(e){
setForm({...form,[e.target.name]:e.target.value});
}

async function handleSubmit(e){

e.preventDefault();

setLoading(true);
setMessage("");

try{

const res = await fetch(`${API_BASE}/api/profile/${code}`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
});

const data = await res.json();

if(!res.ok){
throw new Error(data.message || "Submission failed");
}

setMessage("Vehicle registered successfully");

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

<form onSubmit={handleSubmit} style={styles.form}>

<input
name="owner_name"
placeholder="Owner Name"
onChange={handleChange}
style={styles.input}
/>

<input
name="mobile"
placeholder="Mobile Number"
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
name="emergency_contact"
placeholder="Emergency Contact"
onChange={handleChange}
style={styles.input}
/>

<button
type="submit"
disabled={loading}
style={styles.button}
>
{loading ? "Submitting..." : "Submit"}
</button>

{message && <p style={styles.message}>{message}</p>}

</form>

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
background:"linear-gradient(135deg,#0ea5e9,#2563eb)",
padding:"20px"
},

card:{
width:"100%",
maxWidth:"420px",
padding:"30px",
borderRadius:"20px",
backdropFilter:"blur(20px)",
background:"rgba(255,255,255,0.2)",
border:"1px solid rgba(255,255,255,0.3)",
boxShadow:"0 10px 40px rgba(0,0,0,0.2)"
},

title:{
color:"#fff",
marginBottom:"25px",
textAlign:"center"
},

form:{
display:"flex",
flexDirection:"column",
gap:"14px"
},

input:{
padding:"12px 14px",
borderRadius:"12px",
border:"none",
outline:"none",
background:"rgba(255,255,255,0.9)",
fontSize:"15px"
},

button:{
marginTop:"10px",
padding:"12px",
borderRadius:"12px",
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