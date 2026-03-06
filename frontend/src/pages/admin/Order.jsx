import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Orders(){

const [form,setForm] = useState({
batch_name:"",
agent_name:"",
quantity:""
});

const [orders,setOrders] = useState([]);
const [loading,setLoading] = useState(false);

/* ================= FETCH QR ORDERS ================= */

useEffect(()=>{
fetchOrders();
},[]);

async function fetchOrders(){

try{

const res = await fetch(`${API_BASE}/api/admin/qr-orders`,{
credentials:"include"
});

if(!res.ok) throw new Error("Fetch failed");

const data = await res.json();

setOrders(Array.isArray(data)?data:[]);

}catch(err){

console.error("Orders fetch error:",err);
setOrders([]);

}

}

/* ================= CREATE QR ORDER ================= */

async function handleCreateOrder(){

if(!form.batch_name || !form.agent_name || !form.quantity){
alert("All fields required");
return;
}

try{

setLoading(true);

const res = await fetch(`${API_BASE}/api/admin/qr-orders`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
credentials:"include",
body:JSON.stringify({
batch_name:form.batch_name,
agent_name:form.agent_name,
quantity:Number(form.quantity)
})
});

const data = await res.json();

if(!res.ok){
alert(data.message || "QR order creation failed");
return;
}

setForm({
batch_name:"",
agent_name:"",
quantity:""
});

fetchOrders();

}catch(err){

console.error("Create order error:",err);
alert("Order creation failed");

}finally{

setLoading(false);

}

}

/* ================= DOWNLOAD QR ================= */

function downloadQR(orderId){

window.open(
`${API_BASE}/api/admin/order-qrs/${orderId}`,
"_blank"
);

}

/* ================= UI ================= */

return(

<DashboardLayout>

<div style={styles.wrapper}>

{/* CREATE ORDER */}

<div style={styles.card}>

<h2>Create QR Order</h2>

<div style={styles.grid}>

<input
placeholder="Batch Name"
value={form.batch_name}
onChange={e=>setForm({...form,batch_name:e.target.value})}
/>

<input
placeholder="Agent Name"
value={form.agent_name}
onChange={e=>setForm({...form,agent_name:e.target.value})}
/>

<input
type="number"
placeholder="Quantity"
value={form.quantity}
onChange={e=>setForm({...form,quantity:e.target.value})}
/>

</div>

<button
onClick={handleCreateOrder}
disabled={loading}
>
{loading ? "Creating..." : "Create Order"}
</button>

</div>

{/* ORDER HISTORY */}

<div style={styles.card}>

<h2>QR Order History</h2>

<table style={styles.table}>

<thead>

<tr>
<th>S.No</th>
<th>Batch</th>
<th>Agent</th>
<th>Qty</th>
<th>Status</th>
<th>Created</th>
<th>Download</th>
</tr>

</thead>

<tbody>

{orders.length===0 &&(

<tr>
<td colSpan="7" style={{textAlign:"center",padding:"20px"}}>
No QR orders found
</td>
</tr>

)}

{orders.map((o,index)=>(

<tr key={o.id}>

<td>{index+1}</td>

<td>{o.batch_name}</td>

<td>{o.agent_name}</td>

<td>{o.quantity}</td>

<td>{o.status}</td>

<td>
{o.created_at
? new Date(o.created_at).toLocaleDateString()
: "-"
}
</td>

<td>

<button
style={styles.download}
onClick={()=>downloadQR(o.id)}
>
Download
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</DashboardLayout>

);

}

/* ================= STYLES ================= */

const styles={

wrapper:{
display:"flex",
flexDirection:"column",
gap:"30px"
},

card:{
padding:"25px",
borderRadius:"14px",
background:"rgba(255,255,255,0.15)",
backdropFilter:"blur(12px)",
border:"1px solid rgba(255,255,255,0.2)"
},

grid:{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"10px",
marginBottom:"15px"
},

table:{
width:"100%",
borderCollapse:"collapse",
color:"#000"
},

download:{
padding:"6px 12px",
background:"#22c55e",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}

};