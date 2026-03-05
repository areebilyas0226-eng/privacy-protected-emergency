import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function QRResolver(){

  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(()=>{

    async function resolveQR(){

      try{

        const res = await fetch(`${API_BASE}/api/qr/${code}`);

        if(!res.ok){
          navigate(`/expired/${code}`);
          return;
        }

        const data = await res.json();

        /* profile not registered */
        if(!data.profiles_id){
          navigate(`/register/${code}`);
          return;
        }

        /* inactive */
        if(data.status === "inactive"){
          navigate(`/activate/${code}`);
          return;
        }

        /* active */
        if(data.status === "active"){

          const now = new Date();
          const expiry = new Date(data.expires_at);

          if(expiry > now){
            navigate(`/emergency/${code}`);
          }else{
            navigate(`/expired/${code}`);
          }

          return;
        }

        navigate(`/expired/${code}`);

      }catch{

        navigate(`/expired/${code}`);

      }

    }

    resolveQR();

  },[code,navigate]);

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    }}>
      Resolving QR...
    </div>
  );
}