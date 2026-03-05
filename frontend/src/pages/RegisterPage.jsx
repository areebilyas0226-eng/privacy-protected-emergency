import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function RegisterPage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");

  async function handleRegister(){

    const res = await fetch(`${API_BASE}/api/profiles/register`,{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({ code,name,phone })
    });

    if(res.ok){
      navigate(`/activate/${code}`);
    }

  }

  return (

    <div style={{padding:40}}>

      <h1>Register QR</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={e=>setName(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={e=>setPhone(e.target.value)}
      />

      <button onClick={handleRegister}>
        Register
      </button>

    </div>

  );

}