import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
export default function Dashboard(){return <AuthGuard allowedRoles={["admin","stock","accounts"]}><div style={{display:"flex"}}><Sidebar/><main style={{flex:1,padding:30}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h1>Dashboard</h1><p style={{color:"#667085"}}>Secure SMC Management Dashboard</p></div><LogoutButton/></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16}}>{["Total Labour","Present Today","Absent Today","Total Staff","Monthly Expense"].map((x,i)=><div className="card" style={{padding:20}} key={x}><small>{x}</small><h2>{["124","98","26","18","₹ 1,40,950"][i]}</h2></div>)}</div>
 <div style={{marginTop:20}} className="card"><div style={{padding:25}}><h2>Monthly Expense Summary</h2><p>Diesel · Electricity · Labour Salary · Staff Salary · Thekedar Payment</p></div></div>
 </main></div></AuthGuard>}
