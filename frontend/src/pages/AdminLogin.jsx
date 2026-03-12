import { useState } from "react";
import { API_BASE } from "../config";

export default function AdminLogin(){

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");

async function handleLogin(e){

e.preventDefault();

if(!email || !password){
setError("All fields required");
return;
}

const controller = new AbortController();
const timeout = setTimeout(()=>controller.abort(),10000);

try{

setLoading(true);
setError("");

const res = await fetch(`${API_BASE}/admin/login`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
credentials:"include",
body:JSON.stringify({ email,password }),
signal:controller.signal
});

clearTimeout(timeout);

let data = {};
try{
data = await res.json();
}catch{}

if(!res.ok){
throw new Error(data?.message || `Login failed (${res.status})`);
}

/* redirect after success */
window.location.href="/admin";

}catch(err){

if(err.name === "AbortError"){
setError("Server timeout. Try again.");
}else{
setError(err.message || "Network error");
}

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
background:"linear-gradient(135deg,#4f46e5,#06b6d4,#9333ea)"
}}>

<div style={{
width:"420px",
padding:"40px",
borderRadius:"18px",
background:"rgba(255,255,255,0.15)",
backdropFilter:"blur(20px)",
boxShadow:"0 10px 40px rgba(0,0,0,0.25)",
border:"1px solid rgba(255,255,255,0.25)",
color:"#fff"
}}>

<h2 style={{textAlign:"center",marginBottom:"25px"}}>
Admin Login
</h2>

{error && (
<p style={{
color:"#ffb4b4",
marginBottom:"15px",
textAlign:"center"
}}>
{error}
</p>
)}

<form onSubmit={handleLogin}>

<input
type="email"
placeholder="Admin Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"none",
marginBottom:"15px",
outline:"none"
}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"none",
marginBottom:"20px",
outline:"none"
}}
/>

<button
type="submit"
disabled={loading}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"none",
background:"#ffffff",
color:"#111",
fontWeight:"600",
cursor:"pointer"
}}
>
{loading ? "Logging in..." : "Login"}
</button>

</form>

</div>

</div>

);

}