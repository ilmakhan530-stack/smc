import Sidebar from "@/components/Sidebar";
const labour=[["Rahul Kumar","L-102","09:05 AM","05:42 PM","8h 37m","+12m OT"],["Mohan Singh","L-103","08:58 AM","05:30 PM","8h 32m","+2m OT"],["Suresh Yadav","L-104","09:10 AM","05:45 PM","8h 35m","+15m OT"],["Ramesh Chand","L-105","","","Absent",""]];
export default function Attendance(){
 return <div style={{display:"flex"}}><Sidebar/><main style={{flex:1,padding:30}}>
  <h1>Labour Attendance</h1><div style={{display:"flex",gap:12,margin:"20px 0"}}><input className="input" style={{maxWidth:210}} type="date"/><input className="input" placeholder="Search by name or Labour ID"/><button className="btn btn-primary">Bulk Actions</button></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
   {labour.map(([name,id,inn,out,work,ot])=><div className="card" style={{padding:18}} key={id}><h3>👷 {name}</h3><small>ID: {id}</small>
    {work==="Absent"?<div style={{padding:"35px 0",textAlign:"center",color:"#e53935",fontWeight:800}}>🔴 ABSENT</div>:
    <><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:15}}><input className="input" value={inn} readOnly/><input className="input" value={out} readOnly/></div><p>🕐 Working: {work} <b style={{float:"right",color:"#139b57"}}>{ot}</b></p></>}
    <div style={{display:"flex",gap:7}}><button className="btn">IN NOW</button><button className="btn">OUT NOW</button><button className="btn btn-primary">SAVE</button></div>
   </div>)}
  </div>
 </main></div>
}