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
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        }
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

  return (

    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"#f5f5f5",
      padding:"20px"
    }}>

      <div style={{
        width:"420px",
        background:"#fff",
        padding:"35px",
        borderRadius:"12px",
        textAlign:"center",
        boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
      }}>

        <h2 style={{marginBottom:"20px"}}>
          Activate Emergency Tag
        </h2>

        <p style={{
          lineHeight:1.6,
          color:"#555",
          fontSize:"15px"
        }}>
          You are about to activate your emergency QR tag.
          <br/><br/>
          Each tag is unique and linked to your account.
          You can update your information later.
          <br/><br/>
          On the next step you will enter:
          <br/>
          Vehicle number and phone number.
        </p>

        <button
          onClick={handleActivate}
          disabled={loading}
          style={{
            marginTop:"30px",
            width:"100%",
            padding:"14px",
            fontSize:"16px",
            background:"#2563eb",
            color:"#fff",
            border:"none",
            borderRadius:"8px",
            cursor:"pointer"
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

        <p style={{
          marginTop:"25px",
          fontSize:"14px",
          color:"#666"
        }}>
          Need help?
        </p>

        <a
          href="https://wa.me/919000000000"
          target="_blank"
          rel="noreferrer"
          style={{
            color:"#25D366",
            fontWeight:"600"
          }}
        >
          WhatsApp Live Support
        </a>

      </div>

    </div>

  );

}