"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HardHat, Plus, WalletCards, IndianRupee, RefreshCw } from "lucide-react";

type Contractor = { id:string; name:string; mobile?:string; active?:boolean };
type Work = {
  id:string; contractorId:string; contractorName:string; date:string;
  description:string; quantity:number; rate:number; total:number; note?:string;
};
type Payment = {
  id:string; contractorId:string; contractorName:string; date:string;
  amount:number; kind:"advance"|"payment"; note?:string;
};

const money=(n:number)=>`₹ ${Number(n||0).toLocaleString("en-IN")}`;

export default function Thekedar(){
  const [contractors,setContractors]=useState<Contractor[]>([]);
  const [works,setWorks]=useState<Work[]>([]);
  const [payments,setPayments]=useState<Payment[]>([]);
  const [contractorId,setContractorId]=useState("");
  const [name,setName]=useState("");
  const [mobile,setMobile]=useState("");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [description,setDescription]=useState("");
  const [qty,setQty]=useState("");
  const [rate,setRate]=useState("");
  const [paymentAmount,setPaymentAmount]=useState("");
  const [paymentKind,setPaymentKind]=useState<"advance"|"payment">("payment");
  const [paymentNote,setPaymentNote]=useState("");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    const u1=onSnapshot(collection(db,"contractors"),s=>{
      setContractors(s.docs.map(d=>({id:d.id,...d.data()} as Contractor)));
    },e=>setError(e.message));
    const u2=onSnapshot(collection(db,"thekedarWork"),s=>{
      setWorks(s.docs.map(d=>({id:d.id,...d.data()} as Work)).sort((a,b)=>String(b.date).localeCompare(String(a.date))));
    },e=>setError(e.message));
    const u3=onSnapshot(collection(db,"thekedarPayments"),s=>{
      setPayments(s.docs.map(d=>({id:d.id,...d.data()} as Payment)).sort((a,b)=>String(b.date).localeCompare(String(a.date))));
    },e=>setError(e.message));
    return ()=>{u1();u2();u3()};
  },[]);

  const selected=contractors.find(c=>c.id===contractorId);
  const totalWork=useMemo(()=>works.reduce((n,w)=>n+Number(w.total||0),0),[works]);
  const totalAdvance=useMemo(()=>payments.filter(p=>p.kind==="advance").reduce((n,p)=>n+Number(p.amount||0),0),[payments]);
  const totalPaid=useMemo(()=>payments.filter(p=>p.kind==="payment").reduce((n,p)=>n+Number(p.amount||0),0),[payments]);
  const overallBalance=totalWork-totalAdvance-totalPaid;
  const byContractor=useMemo(()=>{
    return contractors.map(c=>{
      const w=works.filter(x=>x.contractorId===c.id).reduce((n,x)=>n+Number(x.total||0),0);
      const a=payments.filter(x=>x.contractorId===c.id&&x.kind==="advance").reduce((n,x)=>n+Number(x.amount||0),0);
      const p=payments.filter(x=>x.contractorId===c.id&&x.kind==="payment").reduce((n,x)=>n+Number(x.amount||0),0);
      return {...c,total:w,advance:a,paid:p,balance:w-a-p};
    });
  },[contractors,works,payments]);

  async function addContractor(){
    if(!name.trim()){setError("Thekedar ka naam dalo.");return}
    setSaving(true);setError("");setMessage("");
    try{
      await addDoc(collection(db,"contractors"),{name:name.trim(),mobile:mobile.trim(),active:true,createdAt:serverTimestamp()});
      setName("");setMobile("");setMessage("Thekedar saved.");
    }catch(e:any){setError(e?.message||"Thekedar save nahi hua.");}
    finally{setSaving(false)}
  }

  async function addWork(){
    if(!selected){setError("Pehle Thekedar select karo.");return}
    if(Number(qty)<=0||Number(rate)<0){setError("Quantity aur rate sahi dalo.");return}
    setSaving(true);setError("");setMessage("");
    try{
      const total=Number(qty)*Number(rate);
      await addDoc(collection(db,"thekedarWork"),{
        contractorId:selected.id,contractorName:selected.name,date,
        description:description.trim()||"Per-piece work",quantity:Number(qty),
        rate:Number(rate),total,note:"",createdAt:serverTimestamp()
      });
      setDescription("");setQty("");setRate("");setMessage("Work entry saved.");
    }catch(e:any){setError(e?.message||"Work save nahi hua.");}
    finally{setSaving(false)}
  }

  async function addPayment(){
    if(!selected){setError("Pehle Thekedar select karo.");return}
    if(Number(paymentAmount)<=0){setError("Valid amount dalo.");return}
    setSaving(true);setError("");setMessage("");
    try{
      await addDoc(collection(db,"thekedarPayments"),{
        contractorId:selected.id,contractorName:selected.name,date,
        amount:Number(paymentAmount),kind:paymentKind,note:paymentNote.trim(),
        createdAt:serverTimestamp()
      });
      setPaymentAmount("");setPaymentNote("");setMessage(paymentKind==="advance"?"Advance saved.":"Payment saved.");
    }catch(e:any){setError(e?.message||"Payment save nahi hua.");}
    finally{setSaving(false)}
  }

  return <AuthGuard allowedRoles={["admin"]}>
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar/>
      <main style={{flex:1,padding:"30px 34px",minWidth:0}}>
        <div style={{marginBottom:24}}>
          <div style={{color:"#168f67",fontWeight:800,fontSize:12,letterSpacing:2}}>SMC MANAGEMENT</div>
          <h1 style={{margin:"6px 0",color:"#082b68",fontSize:30}}>Thekedar Work & Payment</h1>
          <p style={{margin:0,color:"#6d7d96"}}>Thekedar ka work aur payment Labour/Staff salary se bilkul separate rahega.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:18}}>
          <div className="card" style={{padding:18}}><div style={{color:"#71809a",fontSize:12}}>Total Work</div><b style={{fontSize:22,color:"#17345f"}}>{money(totalWork)}</b></div>
          <div className="card" style={{padding:18}}><div style={{color:"#71809a",fontSize:12}}>Advance</div><b style={{fontSize:22,color:"#b06b00"}}>{money(totalAdvance)}</b></div>
          <div className="card" style={{padding:18}}><div style={{color:"#71809a",fontSize:12}}>Payment</div><b style={{fontSize:22,color:"#168f67"}}>{money(totalPaid)}</b></div>
          <div className="card" style={{padding:18}}><div style={{color:"#71809a",fontSize:12}}>Net Balance</div><b style={{fontSize:22,color:overallBalance<0?"#b42318":"#168f67"}}>{money(overallBalance)}</b><div style={{fontSize:11,color:"#71809a"}}>{overallBalance>=0?"Payable":"Extra paid / carry forward"}</div></div>
        </div>

        {error&&<div style={{background:"#fff1f1",color:"#b42318",padding:12,borderRadius:10,marginBottom:14}}>{error}</div>}
        {message&&<div style={{background:"#eaf9f2",color:"#168f67",padding:12,borderRadius:10,marginBottom:14}}>{message}</div>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
          <div className="card" style={{padding:22}}>
            <h2 style={{margin:"0 0 16px",color:"#17345f",fontSize:18,display:"flex",gap:8,alignItems:"center"}}><HardHat size={19}/> Thekedar</h2>
            <input className="input" placeholder="Thekedar name" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:10}}/>
            <input className="input" placeholder="Mobile (optional)" value={mobile} onChange={e=>setMobile(e.target.value)} style={{marginBottom:12}}/>
            <button className="btn btn-primary" onClick={addContractor} disabled={saving} style={{width:"100%",display:"flex",justifyContent:"center",gap:7}}><Plus size={16}/> Save Thekedar</button>
          </div>

          <div className="card" style={{padding:22}}>
            <h2 style={{margin:"0 0 16px",color:"#17345f",fontSize:18}}>Add Work</h2>
            <select className="input" value={contractorId} onChange={e=>setContractorId(e.target.value)} style={{marginBottom:10}}>
              <option value="">Select Thekedar</option>
              {contractors.filter(c=>c.active!==false).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} style={{marginBottom:10}}/>
            <input className="input" placeholder="Work description" value={description} onChange={e=>setDescription(e.target.value)} style={{marginBottom:10}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <input className="input" type="number" min="0" placeholder="Quantity" value={qty} onChange={e=>setQty(e.target.value)}/>
              <input className="input" type="number" min="0" placeholder="Rate / piece" value={rate} onChange={e=>setRate(e.target.value)}/>
            </div>
            <div style={{fontWeight:800,color:"#17345f",marginBottom:12}}>Total: {money(Number(qty||0)*Number(rate||0))}</div>
            <button className="btn btn-primary" onClick={addWork} disabled={saving} style={{width:"100%"}}>Save Work</button>
          </div>

          <div className="card" style={{padding:22}}>
            <h2 style={{margin:"0 0 16px",color:"#17345f",fontSize:18}}><WalletCards size={19} style={{verticalAlign:"middle",marginRight:7}}/> Advance / Payment</h2>
            <select className="input" value={contractorId} onChange={e=>setContractorId(e.target.value)} style={{marginBottom:10}}>
              <option value="">Select Thekedar</option>
              {contractors.filter(c=>c.active!==false).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <select className="input" value={paymentKind} onChange={e=>setPaymentKind(e.target.value as "advance"|"payment")}>
                <option value="payment">Payment</option><option value="advance">Advance</option>
              </select>
              <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
            <input className="input" type="number" min="1" placeholder="Amount" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} style={{marginBottom:10}}/>
            <input className="input" placeholder="Payment note" value={paymentNote} onChange={e=>setPaymentNote(e.target.value)} style={{marginBottom:12}}/>
            <button className="btn btn-primary" onClick={addPayment} disabled={saving} style={{width:"100%"}}>Save {paymentKind==="advance"?"Advance":"Payment"}</button>
          </div>
        </div>

        <div className="card" style={{padding:22,marginTop:18}}>
          <h2 style={{margin:"0 0 14px",color:"#17345f",fontSize:18}}>Thekedar Balance — Carry Forward</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
              <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>
                {["Thekedar","Total Work","Advance","Paid","Balance","Status"].map(h=><th key={h} style={{padding:10}}>{h}</th>)}
              </tr></thead>
              <tbody>{byContractor.map(c=><tr key={c.id} style={{borderBottom:"1px solid #eef2f7"}}>
                <td style={{padding:10,fontWeight:800}}>{c.name}</td><td style={{padding:10}}>{money(c.total)}</td>
                <td style={{padding:10}}>{money(c.advance)}</td><td style={{padding:10}}>{money(c.paid)}</td>
                <td style={{padding:10,fontWeight:800,color:c.balance<0?"#b42318":"#168f67"}}>{money(c.balance)}</td>
                <td style={{padding:10}}>{c.balance>0?"Unpaid":c.balance<0?"Carry Forward":"Paid"}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p style={{margin:"14px 0 0",fontSize:12,color:"#71809a"}}>Positive balance = next month payable. Negative balance = extra payment/credit and automatically remains part of the running balance.</p>
        </div>

        <div className="card" style={{padding:22,marginTop:18}}>
          <h2 style={{margin:"0 0 14px",color:"#17345f",fontSize:18}}>Work History</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:850}}>
              <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>
                {["Date","Thekedar","Work","Qty","Rate","Total"].map(h=><th key={h} style={{padding:10}}>{h}</th>)}
              </tr></thead>
              <tbody>{works.map(w=><tr key={w.id} style={{borderBottom:"1px solid #eef2f7"}}>
                <td style={{padding:10}}>{w.date}</td><td style={{padding:10,fontWeight:700}}>{w.contractorName}</td>
                <td style={{padding:10}}>{w.description}</td><td style={{padding:10}}>{w.quantity}</td><td style={{padding:10}}>{money(w.rate)}</td><td style={{padding:10,fontWeight:800}}>{money(w.total)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{padding:22,marginTop:18}}>
          <h2 style={{margin:"0 0 14px",color:"#17345f",fontSize:18}}>Payment History</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:750}}>
              <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>
                {["Date","Thekedar","Type","Amount","Note"].map(h=><th key={h} style={{padding:10}}>{h}</th>)}</tr></thead>
              <tbody>{payments.map(p=><tr key={p.id} style={{borderBottom:"1px solid #eef2f7"}}>
                <td style={{padding:10}}>{p.date}</td><td style={{padding:10,fontWeight:700}}>{p.contractorName}</td>
                <td style={{padding:10}}>{p.kind==="advance"?"Advance":"Payment"}</td><td style={{padding:10,fontWeight:800}}>{money(p.amount)}</td><td style={{padding:10}}>{p.note||"—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>

        <div style={{marginTop:18,color:"#71809a",fontSize:12,display:"flex",alignItems:"center",gap:6}}><RefreshCw size={13}/> Thekedar records are independent from Staff/Labour salary and attendance.</div>
      </main>
    </div>
  </AuthGuard>
}
