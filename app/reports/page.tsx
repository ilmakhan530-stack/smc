"use client";

import Link from "next/link";

export default function ReportsPage(){
  return (
    <main style={{padding:24,fontFamily:"Arial, sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h1 style={{margin:0,color:"#17345f"}}>Reports</h1>
          <p style={{color:"#52627a",marginTop:8}}>Office management reports and monthly summaries.</p>
        </div>
        <Link href="/salary" style={{textDecoration:"none",padding:"10px 16px",borderRadius:8,background:"#17345f",color:"#fff",fontWeight:700}}>Salary</Link>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
        <div style={{padding:18,border:"1px solid #e0e6ef",borderRadius:12,background:"#fff"}}>
          <h3 style={{marginTop:0}}>Salary Report</h3>
          <p style={{color:"#52627a"}}>Monthly salary, Sunday labour pay, OT, advance, deduction and final balance.</p>
          <Link href="/salary">Open Salary</Link>
        </div>
        <div style={{padding:18,border:"1px solid #e0e6ef",borderRadius:12,background:"#fff"}}>
          <h3 style={{marginTop:0}}>Attendance Report</h3>
          <p style={{color:"#52627a"}}>Present, absent, half-day and overtime attendance records.</p>
          <Link href="/attendance">Open Attendance</Link>
        </div>
        <div style={{padding:18,border:"1px solid #e0e6ef",borderRadius:12,background:"#fff"}}>
          <h3 style={{marginTop:0}}>Advance Report</h3>
          <p style={{color:"#52627a"}}>Advance entries and employee advance history.</p>
          <Link href="/advance">Open Advance</Link>
        </div>
      </div>
    </main>
  );
}
