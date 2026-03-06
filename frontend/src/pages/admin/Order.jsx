import { useState,useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Orders(){

const [form,setForm] = useState({
batch_name:"",
agent_name:"",
quantity:""
});

const [orders,setOrders] = useState([]);

useEffect(()=>{
fetchOrders();
},[]);

async function fetchOrders(){

try{

const res = await fetch(`${API_BASE}/api/admin/orders`,{
credentials:"include"
});

const data = await res.json();

setOrders(Array.isArray(data)?data:[]);

}catch(err){

console.error(err);

}

}

async function handleCreateOrder(){

if(!form.batch_name || !form.agent_name || !form.quantity){
alert("All fields required");
return;
}

try{

await fetch(`${API_BASE}/api/admin/orders`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
credentials:"include",
body:JSON.stringify({
batch_name:form.batch_name,
agent_name:form.agent_name,
quantity:Number(form.quantity)
})
});

setForm({
batch_name:"",
agent_name:"",
quantity:""
});

fetchOrders();

}catch(err){

console.error(err);

}

}

function downloadQR(orderId){

window.open(
`${API_BASE}/api/admin/order-qrs/${orderId}`,
"_blank"
);

}

return(

<DashboardLayout>

<div style={styles.wrapper}>

<div style={styles.card}>

<h2>Create Order</h2>

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

<button onClick={handleCreateOrder}>
Create Order
</button>

</div>

<div style={styles.card}>

<h2>Order History</h2>

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

{orders.map((o,index)=>(

<tr key={o.id}>

<td>{index+1}</td>
<td>{o.batch_name}</td>
<td>{o.agent_name}</td>
<td>{o.quantity_ordered}</td>
<td>{o.status}</td>
<td>{new Date(o.created_at).toLocaleDateString()}</td>

<td>

<button
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
backdropFilter:"blur(12px)"
},

grid:{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"10px",
marginBottom:"15px"
},

table:{
width:"100%",
borderCollapse:"collapse"
}

};