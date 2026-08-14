 "use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { IndianRupee, Search } from "lucide-react";

type Person={id:string;type:"labour"|"staff";name:string;monthlySalary:number};

export default function SalaryPage(){
  const [people,setPeople]=useState<Person[]>([]);
  const [search,setSearch]=useState("");
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const [values,setValues]=useState<Record<string,{deduction:string;status:"Paid"|"Unpaid"}>>({});
  const [saved,setSaved]=useState<Record<string,boolean>>({});
  const [error,setError]=useState("");

  useEffect(()=>{
    const u1=onSnapshot(collection(db,"labour"),s=>{
      const a=s.docs.map(d=>{const x=d.data() as any;return {id:d.id,type:"labour" as const,name:x.name||"",monthlySalary:Number(x.monthlySalary||0)}});
      setPeople(p=>[...a,...p.filter(x=>x.type==="staff")]);
    },e=>setError(e.message));
    const u2=onSnapshot(collection(db,"staff"),s=>{
      const a=s.docs.map(d=>{const x=d.data() as any;return {id:d.id,type:"staff" as const,name:x.name||"",monthlySalary:Number(x.monthlySalary||0)}});
      setPeople(p=>[...p.filter(x=>x.type==="labour"),...a]);
    },e=>setError(e.message));
    return ()=>{u1();u2()};
  },[]);

  function val(p:Person){
    return values[`${p.type}_${p.id}`]||{deduction:"",status:"Unpaid" as const};
  }

  async function save(p:Person){
    const key=`${p.type}_${p.id}`;
    const v=val(p);
    try{
      await setDoc(doc(db,"salary",`${month}_${p.type}_${p.id}`),{
        personId:p.id,personType:p.type,personName:p.name,month,
        monthlySalary:p.monthlySalary,deduction:Number(v.deduction||0),
        paymentStatus:v.status,updatedAt:new Date().toISOString()
      },{merge:true});
      setSaved(x=>({...x,[key]:true}));
      setTimeout(()=>setSaved(x=>({...x,[key]:false})),1200);
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
            <p style={{margin:0,color:"#6d7d96"}}>Manage salary, deduction and payment status.</p>
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
                const key=`${p.type}_${p.id}`,v=val(p),ded=Number(v.deduction||0),net=Math.max(0,p.monthlySalary-ded);
                return <tr key={key} style={{borderBottom:"1px solid #eef2f7"}}>
                  <td style={{padding:13}}><button style={{border:0,background:"transparent",padding:0,cursor:"pointer",color:"#1266e8",fontWeight:800}} title="Open salary detail">{p.name}</button></td>
                  <td style={{padding:13}}>{p.type==="labour"?"Labour":"Staff"}</td>
                  <td style={{padding:13,fontWeight:700}}>₹ {p.monthlySalary.toLocaleString("en-IN")}</td>
                  <td style={{padding:13}}><input className="input" style={{width:130}} type="number" min="0" value={v.deduction} onChange={e=>setValues(x=>({...x,[key]:{...v,deduction:e.target.value}}))} placeholder="0"/></td>
                  <td style={{padding:13,fontWeight:800}}>₹ {net.toLocaleString("en-IN")}</td>
                  <td style={{padding:13}}><select className="input" value={v.status} onChange={e=>setValues(x=>({...x,[key]:{...v,status:e.target.value as "Paid"|"Unpaid"}}))}><option>Unpaid</option><option>Paid</option></select></td>
                  <td style={{padding:13}}><button className="btn btn-primary" onClick={()=>save(p)}><IndianRupee size={15}/>{saved[key]?"Saved":"Save"}</button></td>
                </tr>
              })}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </AuthGuard>
}
