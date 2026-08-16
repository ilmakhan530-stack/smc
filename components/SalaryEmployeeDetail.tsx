"use client";
import React from "react";

export type DetailRow={date:string;inTime?:string;outTime?:string;status:string;overtimeHours?:number;};
export type AdvanceRow={date:string;amount:number;};
export default function SalaryEmployeeDetail({open,onClose,name,type,month,monthlySalary,openingBalance,earnedSalary,sundayPay,overtimePay,advanceTotal,advanceHistory,deduction,paymentStatus,finalBalance,rows}:{open:boolean;onClose:()=>void;name:string;type:string;month:string;monthlySalary:number;openingBalance:number;earnedSalary:number;sundayPay:number;overtimePay:number;advanceTotal:number;advanceHistory:AdvanceRow[];deduction:number;paymentStatus:"Paid"|"Unpaid";paymentNotes:string;finalBalance:number;rows:DetailRow[]}){
 if(!open)return null;
 const present=rows.filter(r=>r.status==="Present").length, absent=rows.filter(r=>r.status==="Absent").length, half=rows.filter(r=>r.status==="Half Day").length;
 const ot=rows.reduce((n,r)=>n+Number(r.overtimeHours||0),0);
 return <div onMouseDown={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(4,25,55,.48)",display:"grid",placeItems:"center",padding:18}}>
  <div style={{background:"#fff",borderRadius:18,width:1050,maxWidth:"100%",maxHeight:"92vh",overflow:"auto",padding:26}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:11,fontWeight:800,color:"#168f67",letterSpacing:2}}>SALARY HISTORY</div><h2 style={{margin:"5px 0",color:"#082b68"}}>{name}</h2><div style={{fontSize:13,color:"#71809a"}}>{type} · {month}</div></div><button onClick={onClose} style={{border:0,borderRadius:9,padding:"8px 12px",cursor:"pointer"}}>Close</button></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:10,marginTop:18}}>{[["Opening Balance",openingBalance],["Monthly Earned",earnedSalary],["Sunday Labour Pay",sundayPay],["OT Pay",overtimePay],["Advance",advanceTotal],["Deduction",deduction]].map(([l,v])=><div key={String(l)} style={{padding:13,border:"1px solid #e8eef7",borderRadius:12}}><small style={{color:"#71809a"}}>{l}</small><b style={{display:"block",marginTop:5,color:l==="Deduction"?"#c93636":"#17345f"}}>₹ {Number(v).toLocaleString("en-IN")}</b></div>)}<div style={{padding:13,border:"1px solid #e8eef7",borderRadius:12}}><small style={{color:"#71809a"}}>Payment Status</small><b style={{display:"block",marginTop:5,color:paymentStatus==="Paid"?"#168f67":"#c07a14"}}>{paymentStatus}</b></div></div>
   <div style={{marginTop:14,padding:14,border:"1px solid #e8eef7",borderRadius:13}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
     <h3 style={{margin:0,color:"#17345f",fontSize:16}}>Advance History</h3>
     <b style={{color:"#c07a14"}}>Total: ₹ {Number(advanceTotal).toLocaleString("en-IN")}</b>
    </div>
    {advanceHistory.length===0
      ? <div style={{fontSize:13,color:"#71809a"}}>Is month me koi advance nahi liya.</div>
      : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:420}}>
          <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}><th style={{padding:9}}>Date</th><th style={{padding:9}}>Amount</th></tr></thead>
          <tbody>{advanceHistory.map((a,i)=><tr key={i} style={{borderBottom:"1px solid #eef2f7"}}><td style={{padding:9}}>{a.date}</td><td style={{padding:9,fontWeight:800}}>₹ {Number(a.amount).toLocaleString("en-IN")}</td></tr>)}</tbody>
        </table></div>}
   </div>
   <div style={{marginTop:14,padding:14,border:"1px solid #e8eef7",borderRadius:13}}>
    <div style={{fontSize:14,fontWeight:800,color:"#17345f",marginBottom:6}}>Payment Notes</div>
    <div style={{fontSize:13,color:"#52627a",whiteSpace:"pre-wrap"}}>{paymentNotes?.trim()||"No payment note added."}</div>
   </div>
   <div style={{marginTop:12,padding:16,borderRadius:13,background:finalBalance<0?"#fff2f2":"#eef8f3"}}><span style={{color:"#71809a"}}>Final Balance</span><b style={{marginLeft:10,color:finalBalance<0?"#c93636":"#168f67",fontSize:22}}>₹ {finalBalance.toLocaleString("en-IN")}</b>{finalBalance<0&&<span style={{marginLeft:8,color:"#c93636",fontSize:12}}>Due / carry forward</span>}</div>
   <div style={{display:"flex",gap:18,marginTop:14,fontSize:13,color:"#52627b"}}><span>Present: <b>{present}</b></span><span>Absent: <b>{absent}</b></span><span>Half Day: <b>{half}</b></span><span>OT: <b>{ot.toFixed(2)} hr</b></span></div>
   <h3 style={{margin:"22px 0 10px",color:"#17345f"}}>Daily Attendance & OT</h3>
   <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}><thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>{["Date","In","Out","Status","OT Hours"].map(x=><th key={x} style={{padding:10}}>{x}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #eef2f7"}}><td style={{padding:10}}>{r.date}</td><td style={{padding:10}}>{r.inTime||"—"}</td><td style={{padding:10}}>{r.outTime||"—"}</td><td style={{padding:10}}>{r.status}</td><td style={{padding:10}}>{Number(r.overtimeHours||0).toFixed(2)} hr</td></tr>)}</tbody></table></div>
   <div style={{marginTop:16,padding:13,borderRadius:10,background:"#f7fafc",fontSize:12,color:"#52627b"}}>Next month ka Opening Balance = is month ka Final Balance. Negative balance automatically carry forward hoga. Staff has no OT and no Sunday 2×; Labour Sunday work is 2× and Sunday extra hours are paid at 2× OT rate.</div>
  </div>
 </div>
}
