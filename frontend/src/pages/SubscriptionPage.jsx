import {useParams} from "react-router-dom";
import {useState} from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function SubscriptionPage(){

const {code}=useParams();
const [months,setMonths]=useState(1);

async function extend(){

await fetch(`${API_BASE}/api/qr/${code}/extend`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({months})
});

alert("Subscription Extended");

}

return(

<div style={{padding:40}}>

<h2>Renew Subscription</h2>

<select
value={months}
onChange={e=>setMonths(e.target.value)}
>

<option value="1">1 Month</option>
<option value="3">3 Months</option>
<option value="6">6 Months</option>
<option value="12">12 Months</option>

</select>

<button onClick={extend}>
Extend
</button>

</div>

);

}