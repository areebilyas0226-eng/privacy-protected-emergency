import { useEffect,useState,useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL;
const buildUrl = (path)=>`${API_BASE}/api${path}`;

export default function Dashboard(){

const [orders,setOrders] = useState([]);
const [inventory,setInventory] = useState([]);
const [loading,setLoading] = useState(true);

const loadData = useCallback(async()=>{

try{

setLoading(true);

const [ordersRes,inventoryRes] = await Promise.all([
fetch(buildUrl("/admin/qr-orders"),{credentials:"include"}),
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

/* ================= STATS ================= */

const total = inventory.length;

const active =
inventory.filter(i=>i.status==="active").length;

const inactive =
inventory.filter(i=>i.status==="inactive").length;

const expired =
inventory.filter(i=>i.expires_at && new Date(i.expires_at) < new Date()).length;

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

{/* STATS */}

<div className="stats-grid">

<StatCard title="Total Tags" value={total}/>
<StatCard title="Active Tags" value={active}/>
<StatCard title="Inactive Tags" value={inactive}/>
<StatCard title="Expired Tags" value={expired}/>

</div>

{/* SYSTEM STATUS */}

<div className="dashboard-grid">

<div className="system-card">

<h2>Tag System Status</h2>

<div className="system-info">

<div>
<h3>QR Generation</h3>
<p>Orders page creates QR batches.</p>
</div>

<div>
<h3>Activation</h3>
<p>Tags activate after user registration.</p>
</div>

<div>
<h3>Expiry</h3>
<p>Default validity = 5 months after activation.</p>
</div>

</div>

</div>

<div className="analytics-card">

<h2>QR Activation Graph</h2>

<div className="graph-placeholder">
Analytics Graph Coming Soon
</div>

</div>

</div>

{/* RECENT ORDERS */}

<div className="orders-section">

<h2>Recent QR Orders</h2>

<table className="orders-table">

<thead>
<tr>
<th>S.No</th>
<th>Batch</th>
<th>Agent</th>
<th>Type</th>
<th>Qty</th>
<th>Status</th>
<th>Created</th>
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

{orders.slice(0,5).map((o,index)=>(

<tr key={o.id}>

<td>{index+1}</td>

<td>{o.batch_name}</td>

<td>{o.agent_name}</td>

<td>{o.type || "-"}</td>

<td>{o.quantity}</td>

<td className={`status-${o.status}`}>
{o.status}
</td>

<td>
{o.created_at
? new Date(o.created_at).toLocaleDateString()
: "-"
}
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

function StatCard({title,value}){

return(

<div className="stat-card">
<h4>{title}</h4>
<h2>{value}</h2>
</div>

);

}