import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ActivatePage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [tagType,setTagType] = useState("");

  async function handleActivate(){

    if(!code){
      setError("Invalid QR code");
      return;
    }

    if(!tagType){
      setError("Please select tag type");
      return;
    }

    if(!API_BASE){
      setError("API not configured");
      return;
    }

    try{

      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/tags/activate/${code}`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          type:tagType
        })
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.message || "Activation failed");
      }

      /* redirect based on type */

      if(tagType === "vehicle"){
        navigate(`/register/vehicle/${code}`);
      }else{
        navigate(`/register/pet/${code}`);
      }

    }catch(err){

      setError(err.message);

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

  <h2>Company Number</h2>

  <p style={{marginTop:15,lineHeight:1.6}}>
  You are about to activate the emergency QR tag.<br/>
  Each tag is unique.<br/>
  You can update your details later from your account.<br/>
  Enter vehicle number or pet details on the next step.
  </p>

  <div style={{marginTop:20}}>

  <label style={{marginRight:10}}>
  <input
  type="radio"
  value="vehicle"
  checked={tagType==="vehicle"}
  onChange={(e)=>setTagType(e.target.value)}
  />
  Vehicle
  </label>

  <label>
  <input
  type="radio"
  value="pet"
  checked={tagType==="pet"}
  onChange={(e)=>setTagType(e.target.value)}
  />
  Pet
  </label>

  </div>

  <button
  onClick={handleActivate}
  disabled={loading}
  style={{
  marginTop:25,
  padding:"12px 28px",
  background:"#2563eb",
  color:"#fff",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer",
  fontSize:"16px"
  }}
  >
  {loading ? "Activating..." : "Activate Tag"}
  </button>

  {error && (
  <p style={{
  color:"red",
  marginTop:"15px"
  }}>
  {error}
  </p>
  )}

  <p style={{marginTop:25,fontSize:"14px"}}>
  If you need any help please<br/>
  <a
  href="https://wa.me/919999999999"
  target="_blank"
  rel="noopener noreferrer"
  >
  WhatsApp Live Support
  </a>
  </p>

  </div>

  </div>

  );

}