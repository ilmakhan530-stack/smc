 "use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { IndianRupee, Search, X } from "lucide-react";

type Person={id:string;type:"labour"|"staff";name:string;mobile?:string;joiningDate?:string;monthlySalary:number};
type Att={date:string;personId:string;personType:string;status:string;inTime?:string;outTime?:string};
type Adv={date:string;personId:string;personType:string;personName:string;amount:number;note?:string};

export default function SalaryPage(){
  const [people,setPeople]=useState<Person[]>([]);
  const [attendance,setAttendance]=useState<Att[]>([]);
  const [advances,setAdvances]=useState<Adv[]>([]);
  const [search,setSearch]=useState("");
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const [values,setValues]=useState<Record<string,{deduction:string;status:"Paid"|"Unpaid"}>>({});
  const [selected,setSelected]=useState<Person|null>(null);
  const [saved,setSaved]=useState<Record<string,boolean>>({});
  const [error,setError]=useState("");

  useEffect(()=>{
    const u1=onSnapshot(collection(db,"labour"),s=>{
      const a=s.docs.map(d=>{const x=d.data() as any;return {id:d.id,type:"labour" as const,name:x.name||"",mobile:x.mobile||"",joiningDate:x.joiningDate||"",monthlySalary:Number(x.monthlySalary||0)}});
      setPeople(p=>[...a,...p.filter(x=>x.type==="staff")]);
    },e=>setError(e.message));
    const u2=onSnapshot(collection(db,"staff"),s=>{
      const a=s.docs.map(d=>{const x=d.data() as any;return {id:d.id,type:"staff" as const,name:x.name||"",mobile:x.mobile||"",joiningDate:x.joiningDate||"",monthlySalary:Number(x.monthlySalary||0)}});
      setPeople(p=>[...p.filter(x=>x.type==="labour"),...a]);
    },e=>setError(e.message));
    const u3=onSnapshot(collection(db,"attendance"),s=>setAttendance(s.docs.map(d=>d.data() as Att)),e=>setError(e.message));
    const u4=onSnapshot(collection(db,"advances"),s=>setAdvances(s.docs.map(d=>d.data() as Adv)),e=>setError(e.message));
    return ()=>{u1();u2();u3();u4()};
  },[]);

  function val(p:Person){ return values[`${p.type}_${p.id}`]||{deduction:"",status:"Unpaid" as const}; }

  async function save(p:Person){
    const key=`${p.type}_${p.id}`,v=val(p);
    try{
      await setDoc(doc(db,"salary",`${month}_${p.type}_${p.id}`),{
        personId:p.id,personType:p.type,personName:p.name,month,
        monthlySalary:p.monthlySalary,deduction:Number(v.deduction||0),
        paymentStatus:v.status,updatedAt:new Date().toISOString()
      },{merge:true});
      setSaved(x=>({...x,[key]:true})); setTimeout(()=>setSaved(x=>({...x,[key]:false})),1200);
    }catch(e:any){setError(e?.message||"Salary save failed");}
  }

  const filtered=people.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  return <AuthGuard allowedRoles={["admin"]}>
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar/>
      <main style={{flex:1,padding:"30px 34px",minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,marginBottom:22}}>
          <div><div style={{color:"#168f67",fontWeight:800,fontSize:12,letterSpacing:2}}>SMC MANAGEMENT</div>
            <h1 style={{margin:"6px 0",color:"#082b68",fontSize:30}}>Salary Management</h1>
            <p style={{margin:0,color:"#6d7d96"}}>Salary, deduction and payment status.</p>
          </div>
          <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{width:180}}/>
        </div>

        <div className="card" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:14,marginBottom:16}}>
            <h2 style={{margin:0,color:"#17345f",fontSize:18}}>Salary Sheet</h2>
            <div style={{position:"relative",width:280}}>
              <Search size={16} style={{position:"absolute",left:11,top:12,color:"#7b8ca5"}}/>
              <input className="input" style={{paddingLeft:35}} placeholder="Search name" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
          {error&&<div style={{background:"#fff1f1",color:"#b42318",padding:12,borderRadius:10,marginBottom:14}}>{error}</div>}
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:980}}>
              <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>
                {["Name","Type","Monthly Salary","Deduction","Net Payable","Payment Status","Action"].map(h=><th key={h} style={{padding:11}}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map(p=>{
                const key=`${p.type}_${p.id}`,v=val(p),ded=Number(v.deduction||0),net=p.monthlySalary-ded;
                return <tr key={key} style={{borderBottom:"1px solid #eef2f7"}}>
                  <td style={{padding:13}}><button onClick={()=>setSelected(p)} style={{border:0,background:"transparent",padding:0,cursor:"pointer",color:"#1266e8",fontWeight:800,textDecoration:"underline"}}>{p.name}</button></td>
                  <td style={{padding:13}}>{p.type==="labour"?"Labour":"Staff"}</td>
                  <td style={{padding:13,fontWeight:700}}>₹ {p.monthlySalary.toLocaleString("en-IN")}</td>
                  <td style={{padding:13}}><input className="input" style={{width:130}} type="number" min="0" value={v.deduction} onChange={e=>setValues(x=>({...x,[key]:{...v,deduction:e.target.value}}))} placeholder="0"/></td>
                  <td style={{padding:13,fontWeight:800,color:net<0?"#c93636":"#17345f"}}>₹ {net.toLocaleString("en-IN")}</td>
                  <td style={{padding:13}}><select className="input" value={v.status} onChange={e=>setValues(x=>({...x,[key]:{...v,status:e.target.value as "Paid"|"Unpaid"}}))}><option>Unpaid</option><option>Paid</option></select></td>
                  <td style={{padding:13}}><button className="btn btn-primary" onClick={()=>save(p)}><IndianRupee size={15}/>{saved[key]?"Saved":"Save"}</button></td>
                </tr>
              })}</tbody>
            </table>
          </div>
        </div>

        {selected&&<Detail person={selected} month={month} attendance={attendance} advances={advances} onClose={()=>setSelected(null)}/>}
      </main>
    </div>
  </AuthGuard>
}

function Detail({person,month,attendance,advances,onClose}:{person:Person;month:string;attendance:Att[];advances:Adv[];onClose:()=>void}){
  const rows=attendance.filter(a=>a.personId===person.id&&a.personType===person.type&&a.date?.startsWith(month)).sort((a,b)=>a.date.localeCompare(b.date));
  const adv=advances.filter(a=>a.personId===person.id&&a.personType===person.type&&a.date?.startsWith(month)).sort((a,b)=>a.date.localeCompare(b.date));
  const present=rows.filter(x=>x.status==="Present").length, absent=rows.filter(x=>x.status==="Absent").length, half=rows.filter(x=>x.status==="Half Day").length;
  const ot=rows.reduce((sum,x)=>{
    if(!x.inTime||!x.outTime||x.status==="Absent") return sum;
    const [ih,im]=x.inTime.split(":").map(Number),[oh,om]=x.outTime.split(":").map(Number);
    let h=(oh+om/60)-(ih+im/60); if(h<0)h+=24; return sum+Math.max(0,h-8);
  },0);
  const advanceTotal=adv.reduce((s,x)=>s+Number(x.amount||0),0);
  return <div style={{position:"fixed",inset:0,zIndex:70,background:"rgba(8,35,75,.42)",display:"grid",placeItems:"center",padding:18}} onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="card" style={{width:1000,maxWidth:"100%",maxHeight:"92vh",overflow:"auto",padding:26}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div><div style={{fontSize:12,fontWeight:800,color:"#168f67",letterSpacing:1.5}}>EMPLOYEE DETAIL</div><h2 style={{margin:"5px 0",color:"#082b68"}}>{person.name}</h2><div style={{fontSize:13,color:"#6d7d96"}}>{person.mobile||"—"} · Joining: {person.joiningDate||"—"}</div></div>
        <button onClick={onClose} style={{border:0,background:"#f2f5f9",borderRadius:9,padding:8,cursor:"pointer"}}><X size={18}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginTop:18}}>
        {[["Monthly Salary",`₹ ${person.monthlySalary.toLocaleString("en-IN")}`],["Present",present],["Absent",absent],["Half Day",half]].map(([a,b])=><div key={String(a)} style={{padding:14,border:"1px solid #e8eef7",borderRadius:12}}><div style={{fontSize:11,color:"#71809a"}}>{a}</div><b style={{fontSize:19,color:"#17345f"}}>{b}</b></div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,marginTop:12}}>
        <div style={{padding:14,borderRadius:12,background:"#eef7ff"}}><b>Total OT Hours</b><div style={{fontSize:24,color:"#082b68",fontWeight:800}}>{ot.toFixed(2)} hr</div></div>
        <div style={{padding:14,borderRadius:12,background:"#eaf9f2"}}><b>Advance This Month</b><div style={{fontSize:24,color:"#168f67",fontWeight:800}}>₹ {advanceTotal.toLocaleString("en-IN")}</div></div>
      </div>
      <h3 style={{color:"#17345f",margin:"24px 0 10px"}}>{month} · Attendance</h3>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}><thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a"}}>{["Date","In Time","Out Time","Status","OT Hours"].map(h=><th key={h} style={{padding:9}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} style={{borderTop:"1px solid #eef2f7"}}><td style={{padding:9}}>{r.date}</td><td style={{padding:9}}>{r.inTime||"—"}</td><td style={{padding:9}}>{r.outTime||"—"}</td><td style={{padding:9}}>{r.status}</td><td style={{padding:9}}>{r.status==="Absent"?"0":otFor(r.inTime,r.outTime).toFixed(2)} hr</td></tr>)}</tbody></table></div>
      <h3 style={{color:"#17345f",margin:"24px 0 10px"}}>Advance History</h3>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}><thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a"}}>{["Date","Amount","Note"].map(h=><th key={h} style={{padding:9}}>{h}</th>)}</tr></thead><tbody>{adv.map((a,i)=><tr key={i} style={{borderTop:"1px solid #eef2f7"}}><td style={{padding:9}}>{a.date}</td><td style={{padding:9}}>₹ {Number(a.amount||0).toLocaleString("en-IN")}</td><td style={{padding:9}}>{a.note||"—"}</td></tr>)}</tbody></table></div>
    </div>
  </div>
}

function otFor(inTime?:string,outTime?:string){
  if(!inTime||!outTime)return 0;
  const [ih,im]=inTime.split(":").map(Number),[oh,om]=outTime.split(":").map(Number);
  let h=(oh+om/60)-(ih+im/60); if(h<0)h+=24; return Math.max(0,h-8);
}
