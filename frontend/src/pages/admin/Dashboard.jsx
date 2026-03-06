import { useEffect,useState,useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL;
const buildUrl = (path)=>`${API_BASE}/api${path}`;

export default function Dashboard(){

const [orders,setOrders] = useState([]);
const [inventory,setInventory] = useState([]);
const [loading,setLoading] = useState(true);
const [submitting,setSubmitting] = useState(false);

const [orderForm,setOrderForm] = useState({
customer_name:"",
mobile:"",
quantity:""
});

/* ================= LOAD DATA ================= */

const loadData = useCallback(async()=>{

try{

setLoading(true);

const [ordersRes,inventoryRes] = await Promise.all([

fetch(buildUrl("/admin/orders"),{credentials:"include"}),
fetch(buildUrl("/admin/inventory"),{credentials:"include"})

]);

if(ordersRes.status===401){
window.location.replace("/admin-login");
return;
}

const ordersData = await ordersRes.json();
const inventoryData = await inventoryRes.json();

setOrders(Array.isArray(ordersData)?ordersData:[]);
setInventory(Array.isArray(inventoryData)?inventoryData:[]);

}catch(err){

console.error("Dashboard load error",err);

}finally{

setLoading(false);

}

},[]);

useEffect(()=>{
loadData();
},[loadData]);

/* ================= CREATE ORDER ================= */

async function handleCreateOrder(){

const {customer_name,mobile,quantity} = orderForm;

if(!customer_name || !mobile || !quantity){
alert("All fields required");
return;
}

if(submitting) return;

try{

setSubmitting(true);

const res = await fetch(buildUrl("/admin/orders"),{
method:"POST",
credentials:"include",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

batch_name:customer_name,
agent_name:mobile,
quantity:Number(quantity)

})
});

const data = await res.json();

if(!res.ok){
alert(data.message || "Order creation failed");
return;
}

setOrderForm({
customer_name:"",
mobile:"",
quantity:""
});

await loadData();

}catch(err){

console.error(err);
alert("Order creation failed");

}finally{

setSubmitting(false);

}

}

/* ================= STATS ================= */

const total = inventory.length;

const active =
inventory.filter(i=>i.status==="active").length;

const inactive =
inventory.filter(i=>i.status==="inactive").length;

const expired =
inventory.filter(i=>
i.expires_at && new Date(i.expires_at) < new Date()
).length;

if(loading){

return(

<DashboardLayout>

<div className="dashboard-container">

<h2>Loading Dashboard...</h2>

</div>

</DashboardLayout>

);

}

return(

<DashboardLayout>

<div className="dashboard-container">

<h1 className="dashboard-title">
Operational Overview
</h1>

{/* ================= STATS ================= */}

<div className="stats-grid">

<StatCard title="Total Tags" value={total}/>
<StatCard title="Active Tags" value={active}/>
<StatCard title="Inactive Tags" value={inactive}/>
<StatCard title="Expired Tags" value={expired}/>

</div>

{/* ================= ORDER SECTION ================= */}

<div className="dashboard-grid">

<div className="order-card">

<h2>Create Tag Order</h2>

<input
className="form-input"
placeholder="Customer Name"
value={orderForm.customer_name}
onChange={(e)=>
setOrderForm({...orderForm,customer_name:e.target.value})
}
/>

<input
className="form-input"
placeholder="Mobile"
value={orderForm.mobile}
onChange={(e)=>
setOrderForm({...orderForm,mobile:e.target.value})
}
/>

<input
className="form-input"
type="number"
placeholder="Quantity"
value={orderForm.quantity}
onChange={(e)=>
setOrderForm({...orderForm,quantity:e.target.value})
}
/>

<button
className="primary-btn"
onClick={handleCreateOrder}
disabled={submitting}
>

{submitting ? "Creating..." : "Create Order"}

</button>

</div>

<div className="analytics-card">

<h2>QR Activation Graph</h2>

<div className="graph-placeholder">
Analytics Graph Coming Soon
</div>

</div>

</div>

{/* ================= RECENT ORDERS ================= */}

<div className="orders-section">

<h2>Recent Orders</h2>

<table className="orders-table">

<thead>

<tr>
<th>S.No</th>
<th>Name</th>
<th>Mobile</th>
<th>Date</th>
<th>Ordered</th>
<th>Fulfilled</th>
<th>Status</th>
</tr>

</thead>

<tbody>

{orders.length===0 &&(

<tr>
<td colSpan="7">
No Orders Found
</td>
</tr>

)}

{orders.map((o,index)=>(

<tr key={o.id}>

<td>{index+1}</td>

<td>{o.batch_name}</td>

<td>{o.agent_name}</td>

<td>
{new Date(o.created_at).toLocaleDateString()}
</td>

<td>{o.quantity_ordered}</td>

<td>{o.quantity_fulfilled}</td>

<td className={`status-${o.status}`}>
{o.status}
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

/* ================= STAT CARD ================= */

function StatCard({title,value}){

return(

<div className="stat-card">

<h4>{title}</h4>

<h2>{value}</h2>

</div>

);

}