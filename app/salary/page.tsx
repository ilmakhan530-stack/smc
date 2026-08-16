"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import SalaryEmployeeDetail from "@/components/SalaryEmployeeDetail";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { IndianRupee, Search, WalletCards } from "lucide-react";

type Person={id:string;type:"labour"|"staff";name:string;mobile:string;monthlySalary:number;active:boolean};
type Attendance={personId:string;personType:"labour"|"staff";date:string;status:"Present"|"Absent"|"Half Day";inTime?:string;outTime?:string;overtimeHours?:number};
type Advance={personId:string;personType:"labour"|"staff";personName:string;amount:number;date:string};
type SalaryDoc={month:string;personId:string;personType:string;balance:number;deduction?:number;paymentStatus?:"Paid"|"Unpaid"};
function monthKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
function daysInMonth(key:string){const [y,m]=key.split("-").map(Number);return new Date(y,m,0).getDate()}
function isSunday(date:string){return new Date(`${date}T00:00:00`).getDay()===0}
function monthOf(date:string){return date.slice(0,7)}
function previousMonth(key:string){const [y,m]=key.split("-").map(Number);const d=new Date(y,m-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}

export default function SalaryPage(){
 const [people,setPeople]=useState<Person[]>([]),[attendance,setAttendance]=useState<Attendance[]>([]),[advances,setAdvances]=useState<Advance[]>([]),[savedSalaries,setSavedSalaries]=useState<SalaryDoc[]>([]),[month,setMonth]=useState(monthKey()),[search,setSearch]=useState(""),[saving,setSaving]=useState<string|null>(null),[error,setError]=useState(""),[detail,setDetail]=useState<Person|null>(null),[deductions,setDeductions]=useState<Record<string,number>>({}),[paymentStatus,setPaymentStatus]=useState<Record<string,"Paid"|"Unpaid">>({});
 useEffect(()=>{const u1=onSnapshot(collection(db,"labour"),s=>setPeople(prev=>[...s.docs.map(d=>{const x=d.data() as any;return{id:d.id,type:"labour" as const,name:x.name||"",mobile:x.mobile||"",monthlySalary:Number(x.monthlySalary||0),active:x.active!==false}}),...prev.filter(p=>p.type==="staff")]),e=>setError(e.message));const u2=onSnapshot(collection(db,"staff"),s=>setPeople(prev=>[...prev.filter(p=>p.type==="labour"),...s.docs.map(d=>{const x=d.data() as any;return{id:d.id,type:"staff" as const,name:x.name||"",mobile:x.mobile||"",monthlySalary:Number(x.monthlySalary||0),active:x.active!==false}})]),e=>setError(e.message));return()=>{u1();u2()}},[]);
 useEffect(()=>onSnapshot(collection(db,"attendance"),s=>setAttendance(s.docs.map(d=>d.data() as Attendance)),e=>setError(e.message)),[]);
 useEffect(()=>onSnapshot(collection(db,"advances"),s=>setAdvances(s.docs.map(d=>d.data() as Advance)),e=>setError(e.message)),[]);
 useEffect(()=>onSnapshot(collection(db,"salary"),s=>setSavedSalaries(s.docs.map(d=>d.data() as SalaryDoc)),e=>setError(e.message)),[]);
 const activePeople=useMemo(()=>people.filter(p=>p.active&&`${p.name} ${p.mobile}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)),[people,search]);
 const salaryDays=daysInMonth(month);
 function calc(p:Person){
   const rows=attendance.filter(a=>a.personId===p.id&&a.personType===p.type&&monthOf(a.date)===month);
   const sundayRows=rows.filter(a=>isSunday(a.date));
   const regular=rows.filter(a=>!isSunday(a.date));
   const sundayWork=sundayRows.filter(a=>p.type==="labour"&&a.status!=="Absent");
   const present=regular.filter(a=>a.status==="Present").length + (p.type==="labour" ? sundayWork.filter(a=>a.status==="Present").length : 0);
   const absent=regular.filter(a=>a.status==="Absent").length + (p.type==="labour" ? sundayRows.filter(a=>a.status==="Absent").length : 0);
   const half=regular.filter(a=>a.status==="Half Day").length + (p.type==="labour" ? sundayWork.filter(a=>a.status==="Half Day").length : 0);
   const payableDays=present+half*.5;
   const dayRate=salaryDays?Number(p.monthlySalary||0)/salaryDays:0;

   // Staff: normal monthly attendance pay only; no Sunday 2× and no OT.
   // Labour: Sunday worked day is paid at 2× (normal day + equal Sunday premium).
   const regularEarned=dayRate*(regular.filter(a=>a.status==="Present").length + regular.filter(a=>a.status==="Half Day").length*.5);
   const sundayBase= p.type==="labour" ? sundayWork.reduce((n,a)=>n+dayRate*(a.status==="Half Day"?.5:1),0) : 0;
   const sundayPremium= p.type==="labour" ? sundayBase : 0;
   const sundayPay=sundayBase+sundayPremium;

   // OT is already calculated from attendance. Staff OT is forcibly ignored.
   const overtimeHours=p.type==="staff"
      ? 0
      : rows.reduce((n,a)=>n+Number(a.overtimeHours||0),0);
   const normalOtRate=dayRate/8;
   const weekdayOtHours= p.type==="labour"
      ? regular.reduce((n,a)=>n+Number(a.overtimeHours||0),0)
      : 0;
   const sundayOtHours= p.type==="labour"
      ? sundayRows.reduce((n,a)=>n+Number(a.overtimeHours||0),0)
      : 0;
   const overtimePay=Math.round(weekdayOtHours*normalOtRate + sundayOtHours*normalOtRate*2);

   const earned=Math.round(regularEarned+sundayPay+overtimePay);
   const advanceTotal=advances.filter(a=>a.personId===p.id&&a.personType===p.type&&monthOf(a.date)===month).reduce((n,a)=>n+Number(a.amount||0),0);
   const prev=previousMonth(month);
   const previousSaved=savedSalaries.filter(x=>x.personId===p.id&&x.personType===p.type&&x.month===prev)[0];
   const openingBalance=Number(previousSaved?.balance||0);
   const key=`${p.type}_${p.id}`;
   const savedCurrent=savedSalaries.find(x=>x.personId===p.id&&x.personType===p.type&&x.month===month);
   const deduction=Object.prototype.hasOwnProperty.call(deductions,key)
      ? Number(deductions[key]||0)
      : Number(savedCurrent?.deduction||0);
   const currentPaymentStatus=Object.prototype.hasOwnProperty.call(paymentStatus,key)
      ? paymentStatus[key]
      : (savedCurrent?.paymentStatus||"Unpaid");
   const currentPaymentNotes=Object.prototype.hasOwnProperty.call(paymentNotes,key)
      ? String(paymentNotes[key]||"")
      : String(savedCurrent?.paymentNotes||"");
   const finalBalance=Math.round(openingBalance+earned-advanceTotal-deduction);
   return {
     rows,present,absent,half,payableDays,earned,
     sundayPay:Math.round(sundayPay),
     sundayPremium:Math.round(sundayPremium),
     overtimeHours,
     weekdayOtHours,
     sundayOtHours,
     overtimePay,
     advanceTotal,
     openingBalance,
     deduction,
     finalBalance,
     paymentStatus:paymentStatus[key]||"Unpaid"
   };
 }
 async function save(p:Person){
   const x=calc(p),key=`${p.type}_${p.id}`;
   setSaving(key);setError("");
   try{
     await setDoc(doc(db,"salary",`${month}_${p.type}_${p.id}`),{
       month,personId:p.id,personType:p.type,personName:p.name,monthlySalary:p.monthlySalary,
       presentDays:x.present,absentDays:x.absent,halfDays:x.half,payableDays:x.payableDays,
       earnedSalary:x.earned,sundayDoublePay:x.sundayPay,overtimeHours:x.overtimeHours,
       weekdayOtHours:x.weekdayOtHours,sundayOtHours:x.sundayOtHours,overtimePay:x.overtimePay,
       advance:x.advanceTotal,deduction:x.deduction,openingBalance:x.openingBalance,
       balance:x.finalBalance,finalBalance:x.finalBalance,
       paymentStatus:x.paymentStatus,updatedAt:new Date().toISOString()
     })
   }catch(e:any){setError(e?.message||"Unable to save salary")}
   finally{setSaving(null)}
 }
 const totals=activePeople.reduce((a,p)=>{const s=calc(p);a.monthly+=p.monthlySalary;a.earned+=s.earned;a.balance+=s.finalBalance;return a},{monthly:0,earned:0,balance:0});
 return <AuthGuard allowedRoles={["admin"]}><div style={{display:"flex",minHeight:"100vh"}}><Sidebar/><main style={{flex:1,padding:"30px 34px",minWidth:0}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,marginBottom:22}}><div><div style={{color:"#168f67",fontWeight:800,fontSize:12,letterSpacing:2}}>SMC MANAGEMENT</div><h1 style={{margin:"6px 0",color:"#082b68",fontSize:30}}>Salary Management</h1><p style={{margin:0,color:"#6d7d96"}}>Monthly salary, attendance, Labour Sunday 2×, Labour overtime and balance.</p></div><div style={{display:"flex",alignItems:"center",gap:10}}><label style={{color:"#52627b",fontWeight:700}}>Month</label><input className="input" style={{width:155}} type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:14,marginBottom:18}}>{[["Active People",activePeople.length,"#1266e8",WalletCards],["Monthly Salary",totals.monthly,"#168f67",IndianRupee],["Earned + OT + Sunday",totals.earned,"#082b68",IndianRupee],["Final Balance",totals.balance,"#17345f",WalletCards]].map(([label,value,color,Icon]:any)=><div className="card" key={label} style={{padding:18,display:"flex",alignItems:"center",gap:12}}><div style={{width:42,height:42,borderRadius:12,background:"#edf4ff",color,display:"grid",placeItems:"center"}}><Icon size={20}/></div><div><div style={{color:"#71809a",fontSize:12,fontWeight:700}}>{label}</div><b style={{display:"block",marginTop:4,color:"#17345f",fontSize:22}}>{label==="Active People"?value:`₹ ${Number(value).toLocaleString("en-IN")}`}</b></div></div>)}</div>
  <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center"}}><div style={{position:"relative",width:330,maxWidth:"100%"}}><Search size={17} style={{position:"absolute",left:12,top:12,color:"#7b8ca5"}}/><input className="input" style={{paddingLeft:38}} placeholder="Search name or mobile" value={search} onChange={e=>setSearch(e.target.value)}/></div><div style={{color:"#71809a",fontSize:12}}>Monthly salary ÷ calendar days • Staff starts at 09:00 and has no OT/Sunday 2× • Labour Sunday = 2× • Sunday extra hours = 2× OT • Advance is separate • Negative balance carries forward.</div></div>
  {error&&<div style={{background:"#fff1f1",border:"1px solid #f0caca",color:"#b42318",padding:12,borderRadius:10,marginBottom:16,fontSize:13}}>{error}</div>}
  <div className="card" style={{padding:20,overflowX:"auto"}}><h2 style={{margin:"0 0 15px",color:"#17345f",fontSize:18}}>Salary Sheet — {month}</h2><table style={{width:"100%",borderCollapse:"collapse",minWidth:1180}}><thead><tr style={{textAlign:"left",color:"#71809a",fontSize:11,borderBottom:"1px solid #e8eef7"}}>{['Name','Type','Monthly','P','A','½','Earned','OT Hours','Deduction','Balance','Paid/Unpaid','Action'].map(h=><th key={h} style={{padding:"11px 8px"}}>{h}</th>)}</tr></thead><tbody>{activePeople.length===0?<tr><td colSpan={12} style={{padding:45,textAlign:"center",color:"#71809a"}}>No active Labour or Staff records.</td></tr>:activePeople.map(p=>{const s=calc(p),key=`${p.type}_${p.id}`;return <tr key={key} style={{borderBottom:"1px solid #eef2f7"}}><td style={{padding:12,fontWeight:800,color:"#17345f"}}><button onClick={()=>setDetail(p)} style={{border:0,background:"transparent",padding:0,cursor:"pointer",color:"#1266e8",fontWeight:800,textDecoration:"underline"}}>{p.name}</button></td><td style={{padding:12}}>{p.type==="labour"?"Labour":"Staff"}</td><td style={{padding:12,fontWeight:700}}>₹ {p.monthlySalary.toLocaleString("en-IN")}</td><td style={{padding:12,color:"#168f67",fontWeight:700}}>{s.present}</td><td style={{padding:12,color:"#c93636",fontWeight:700}}>{s.absent}</td><td style={{padding:12,color:"#b7791f",fontWeight:700}}>{s.half}</td><td style={{padding:12,fontWeight:800}}>₹ {s.earned.toLocaleString("en-IN")}</td><td style={{padding:12}}>{s.overtimeHours.toFixed(2)} hr</td><td style={{padding:8}}><input className="input" type="number" min="0" style={{width:105}} value={s.deduction||""} placeholder="0" onChange={e=>setDeductions(v=>({...v,[key]:Number(e.target.value||0)}))}/></td><td style={{padding:12,fontWeight:800,color:s.finalBalance<0?"#c93636":"#082b68"}}>₹ {s.finalBalance.toLocaleString("en-IN")}</td><td style={{padding:8}}><select className="input" style={{width:105}} value={s.paymentStatus} onChange={e=>setPaymentStatus(v=>({...v,[key]:e.target.value as "Paid"|"Unpaid"}))}><option>Unpaid</option><option>Paid</option></select></td><td style={{padding:8}}><button className="btn btn-primary" disabled={saving===key} onClick={()=>save(p)}>{saving===key?"Saving…":"Save"}</button></td></tr>})}</tbody></table></div>
  {detail&&(()=>{const s=calc(detail);const advanceHistory=advances.filter(a=>a.personId===detail.id&&a.personType===detail.type&&monthOf(a.date)===month).sort((a,b)=>a.date.localeCompare(b.date)).map(a=>({date:a.date,amount:Number(a.amount||0)}));return <SalaryEmployeeDetail open={true} onClose={()=>setDetail(null)} name={detail.name} type={detail.type==="labour"?"Labour":"Staff"} month={month} monthlySalary={detail.monthlySalary} openingBalance={s.openingBalance} earnedSalary={s.earned} sundayPay={s.sundayPay} overtimePay={s.overtimePay} advanceTotal={s.advanceTotal} advanceHistory={advanceHistory} deduction={s.deduction} paymentStatus={s.paymentStatus} paymentNotes={s.paymentNotes} finalBalance={s.finalBalance} rows={s.rows}/>})()}
 </main></div></AuthGuard>
}
