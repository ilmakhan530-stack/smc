 "use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IndianRupee, WalletCards } from "lucide-react";

type Person={id:string;type:"labour"|"staff";name:string};

export default function AdvancePage(){
  const [people,setPeople]=useState<Person[]>([]);
  const [personId,setPersonId]=useState("");
  const [amount,setAmount]=useState("");
  const [note,setNote]=useState("");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [advances,setAdvances]=useState<any[]>([]);

  useEffect(()=>{
    const u1=onSnapshot(collection(db,"labour"),s=>{
      const a=s.docs.map(d=>({id:d.id,type:"labour" as const,name:(d.data() as any).name||""}));
      setPeople(p=>[...a,...p.filter(x=>x.type==="staff")]);
    },e=>setError(e.message));
    const u2=onSnapshot(collection(db,"staff"),s=>{
      const a=s.docs.map(d=>({id:d.id,type:"staff" as const,name:(d.data() as any).name||""}));
      setPeople(p=>[...p.filter(x=>x.type==="labour"),...a]);
    },e=>setError(e.message));
    const q=query(collection(db,"advances"),orderBy("createdAt","desc"));
    const u3=onSnapshot(q,s=>setAdvances(s.docs.map(d=>({id:d.id,...d.data()}))),e=>setError(e.message));
    return ()=>{u1();u2();u3()};
  },[]);

  const selected=people.find(p=>`${p.type}_${p.id}`===personId);
  const total=useMemo(()=>advances.reduce((n,a)=>n+Number(a.amount||0),0),[advances]);

  async function save(){
    if(!selected){setError("Staff ya Labour select karo.");return}
    if(Number(amount)<=0){setError("Valid advance amount dalo.");return}
    setSaving(true);setError("");setMessage("");
    try{
      await addDoc(collection(db,"advances"),{
        personId:selected.id, personType:selected.type, personName:selected.name,
        amount:Number(amount), date, note:note.trim(), createdAt:serverTimestamp()
      });
      setAmount("");setNote("");setMessage("Advance saved successfully.");
    }catch(e:any){setError(e?.message||"Advance save nahi hua.");}
    finally{setSaving(false)}
  }

  return <AuthGuard allowedRoles={["admin"]}>
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar/>
      <main style={{flex:1,padding:"30px 34px",minWidth:0}}>
        <div style={{marginBottom:24}}>
          <div style={{color:"#168f67",fontWeight:800,fontSize:12,letterSpacing:2}}>SMC MANAGEMENT</div>
          <h1 style={{margin:"6px 0",color:"#082b68",fontSize:30}}>Advance Management</h1>
          <p style={{margin:0,color:"#6d7d96"}}>Staff ya Labour ko advance dene ke liye naam select karein, amount enter karein aur save karein.</p>
        </div>

        <div className="card" style={{maxWidth:720,padding:26}}>
          <div style={{display:"grid",gap:16}}>
            <label style={{fontSize:13,fontWeight:800,color:"#52627b"}}>Staff / Labour
              <select className="input" style={{marginTop:7}} value={personId} onChange={e=>setPersonId(e.target.value)}>
                <option value="">Select Name</option>
                {people.sort((a,b)=>a.name.localeCompare(b.name)).map(p=>
                  <option key={`${p.type}_${p.id}`} value={`${p.type}_${p.id}`}>{p.name} ({p.type==="labour"?"Labour":"Staff"})</option>
                )}
              </select>
            </label>

            <label style={{fontSize:13,fontWeight:800,color:"#52627b"}}>Advance Amount (₹)
              <input className="input" style={{marginTop:7}} type="number" min="1" placeholder="Enter amount" value={amount} onChange={e=>setAmount(e.target.value)}/>
            </label>

            <label style={{fontSize:13,fontWeight:800,color:"#52627b"}}>Date
              <input className="input" style={{marginTop:7}} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </label>

            <label style={{fontSize:13,fontWeight:800,color:"#52627b"}}>Note (Optional)
              <input className="input" style={{marginTop:7}} placeholder="Optional" value={note} onChange={e=>setNote(e.target.value)}/>
            </label>

            {error&&<div style={{background:"#fff1f1",color:"#b42318",padding:12,borderRadius:10}}>{error}</div>}
            {message&&<div style={{background:"#eaf9f2",color:"#168f67",padding:12,borderRadius:10}}>{message}</div>}

            <button className="btn btn-primary" onClick={save} disabled={saving} style={{width:"100%",display:"flex",justifyContent:"center",gap:8}}>
              <WalletCards size={17}/>{saving?"Saving…":"Save Advance"}
            </button>
          </div>
        </div>

        <div className="card" style={{maxWidth:720,padding:22,marginTop:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <IndianRupee size={20} color="#168f67"/>
            <h2 style={{margin:0,color:"#17345f",fontSize:18}}>Advance Records</h2>
          </div>
          <div style={{fontSize:13,color:"#71809a",marginBottom:14}}>Total recorded advance: <b style={{color:"#082b68"}}>₹ {total.toLocaleString("en-IN")}</b></div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
              <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>
                {["Date","Name","Type","Amount","Note"].map(h=><th key={h} style={{padding:10}}>{h}</th>)}
              </tr></thead>
              <tbody>{advances.map(a=><tr key={a.id} style={{borderBottom:"1px solid #eef2f7"}}>
                <td style={{padding:10}}>{a.date}</td><td style={{padding:10,fontWeight:700}}>{a.personName}</td>
                <td style={{padding:10}}>{a.personType==="labour"?"Labour":"Staff"}</td>
                <td style={{padding:10,fontWeight:700}}>₹ {Number(a.amount||0).toLocaleString("en-IN")}</td><td style={{padding:10}}>{a.note||"—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </AuthGuard>
}
