import { Link, useLocation } from "react-router-dom";

export default function Sidebar(){

const location = useLocation();

return(

<div style={styles.sidebar}>

<h2 style={styles.logo}>Admin</h2>

<NavItem to="/admin" label="Dashboard" active={location.pathname==="/admin"}/>
<NavItem to="/admin/orders" label="Orders" active={location.pathname==="/admin/orders"}/>
<NavItem to="/admin/inventory" label="Inventory" active={location.pathname==="/admin/inventory"}/>

<div style={{marginTop:"auto"}}>
<Link to="/admin-login" style={styles.logout}>
Logout
</Link>
</div>

</div>

);

}

function NavItem({to,label,active}){

return(

<Link
to={to}
style={{
...styles.link,
...(active?styles.active:{})
}}
>
{label}
</Link>

);

}

const styles={

sidebar:{
width:240,
padding:25,
display:"flex",
flexDirection:"column",
minHeight:"100vh",
background:"rgba(255,255,255,0.12)",
backdropFilter:"blur(20px)",
borderRight:"1px solid rgba(255,255,255,0.2)",
color:"white"
},

logo:{
marginBottom:30
},

link:{
display:"block",
padding:"12px 16px",
marginBottom:10,
borderRadius:10,
textDecoration:"none",
color:"white"
},

active:{
background:"rgba(255,255,255,0.25)"
},

logout:{
marginTop:20,
display:"block",
padding:"10px",
borderRadius:8,
textDecoration:"none",
background:"rgba(255,255,255,0.2)",
color:"white",
textAlign:"center"
}

};