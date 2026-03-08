import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ActivatePage() {

const { code } = useParams();
const navigate = useNavigate();

const [loading,setLoading] = useState(false);
const [error,setError] = useState("");

async function handleActivate(){

if(!API_BASE){
setError("API not configured");
return;
}

try{

setLoading(true);
setError("");

const res = await fetch(`${API_BASE}/api/tags/activate/${code}`,{
method:"POST"
});

const data = await res.json();

if(!res.ok){
throw new Error(data.message || "Activation failed");
}

navigate(`/register/${code}`);

}catch(err){
setError(err.message);
}finally{
setLoading(false);
}

}

return(

<div style={styles.page}>

<div style={styles.card}>

<h2 style={styles.title}>
Activate Emergency Tag
</h2>

<p style={styles.text}>
You are about to activate your emergency QR tag.
<br/><br/>
Next step will ask for vehicle details.
</p>

<button
onClick={handleActivate}
disabled={loading}
style={styles.button}
>
{loading ? "Activating..." : "Activate Tag"}
</button>

{error && <p style={styles.error}>{error}</p>}

<p style={styles.help}>Need help?</p>

<a
href="https://wa.me/919000000000"
target="_blank"
rel="noreferrer"
style={styles.whatsapp}
>
WhatsApp Live Support
</a>

</div>

</div>

);

}

const styles={

page:{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"linear-gradient(135deg,#3b82f6,#1d4ed8)"
},

card:{
width:"90%",
maxWidth:"420px",
background:"rgba(255,255,255,0.2)",
backdropFilter:"blur(25px)",
padding:"35px",
borderRadius:"20px",
textAlign:"center",
color:"#fff",
border:"1px solid rgba(255,255,255,0.3)"
},

title:{
marginBottom:"20px"
},

text:{
lineHeight:1.6,
fontSize:"15px"
},

button:{
marginTop:"25px",
width:"100%",
padding:"14px",
fontSize:"16px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"10px",
cursor:"pointer"
},

error:{
marginTop:"15px",
color:"#ffdddd"
},

help:{
marginTop:"20px",
fontSize:"14px"
},

whatsapp:{
color:"#25D366",
fontWeight:"600"
}

};