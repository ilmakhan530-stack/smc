import React from "react";

export type SalaryHistoryRow = {
  date: string;
  inTime?: string;
  outTime?: string;
  status: "Present" | "Absent" | "Half Day";
  overtimeHours?: number;
  advance?: number;
};

export type SalaryEmployeeDetailProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  mobile?: string;
  joiningDate?: string;
  monthlySalary: number;
  month: string;
  previousBalance: number;
  earnedSalary: number;
  sundayPay: number;
  overtimePay: number;
  advanceTotal: number;
  finalBalance: number;
  rows: SalaryHistoryRow[];
};

export default function SalaryEmployeeDetail(p: SalaryEmployeeDetailProps) {
  if (!p.open) return null;

  const present = p.rows.filter(x => x.status === "Present").length;
  const absent = p.rows.filter(x => x.status === "Absent").length;
  const half = p.rows.filter(x => x.status === "Half Day").length;
  const otHours = p.rows.reduce((n,x) => n + Number(x.overtimeHours || 0), 0);

  return (
    <div style={{position:"fixed",inset:0,zIndex:80,background:"rgba(8,35,75,.42)",display:"grid",placeItems:"center",padding:18}}
      onMouseDown={e=>{if(e.target===e.currentTarget)p.onClose()}}>
      <div style={{background:"#fff",borderRadius:18,width:980,maxWidth:"100%",maxHeight:"92vh",overflow:"auto",padding:26}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:"#168f67",letterSpacing:1.5}}>EMPLOYEE SALARY DETAIL</div>
            <h2 style={{margin:"5px 0",color:"#082b68"}}>{p.name}</h2>
            <div style={{fontSize:13,color:"#6d7d96"}}>{p.mobile || "—"} · Joining: {p.joiningDate || "—"}</div>
          </div>
          <button onClick={p.onClose} style={{border:0,borderRadius:9,padding:"8px 12px",cursor:"pointer"}}>Close</button>
        </div>

        <div style={{marginTop:18,padding:16,borderRadius:14,background:"#eef7ff",display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12}}>
          {[
            ["Monthly Salary",`₹ ${p.monthlySalary.toLocaleString("en-IN")}`],
            ["Previous Balance",`₹ ${p.previousBalance.toLocaleString("en-IN")}`],
            ["Earned Salary",`₹ ${p.earnedSalary.toLocaleString("en-IN")}`],
            ["Final Balance",`₹ ${p.finalBalance.toLocaleString("en-IN")}`],
          ].map(([a,b])=><div key={a}><div style={{fontSize:11,color:"#687993"}}>{a}</div><b style={{fontSize:19,color:Number(String(b).replace(/[^\d-]/g,""))<0?"#c93636":"#082b68"}}>{b}</b></div>)}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:10,marginTop:14}}>
          {[
            ["Present",present],["Absent",absent],["Half Day",half],
            ["Total OT Hours",otHours],["Advance",`₹ ${p.advanceTotal.toLocaleString("en-IN")}`]
          ].map(([a,b])=><div key={String(a)} style={{padding:14,border:"1px solid #e8eef7",borderRadius:12}}>
            <div style={{fontSize:11,color:"#71809a"}}>{a}</div><b style={{display:"block",marginTop:4,color:"#17345f"}}>{b}</b>
          </div>)}
        </div>

        <h3 style={{color:"#17345f",margin:"24px 0 10px"}}>{p.month} · Daily History</h3>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
            <thead><tr style={{textAlign:"left",fontSize:12,color:"#71809a",borderBottom:"1px solid #e8eef7"}}>
              {["Date","In Time","Out Time","Status","OT Hours","Advance"].map(h=><th key={h} style={{padding:10}}>{h}</th>)}
            </tr></thead>
            <tbody>{p.rows.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #eef2f7"}}>
              <td style={{padding:10}}>{r.date}</td><td style={{padding:10}}>{r.inTime||"—"}</td><td style={{padding:10}}>{r.outTime||"—"}</td>
              <td style={{padding:10}}>{r.status}</td><td style={{padding:10}}>{Number(r.overtimeHours||0).toFixed(2)} hr</td>
              <td style={{padding:10}}>₹ {Number(r.advance||0).toLocaleString("en-IN")}</td>
            </tr>)}</tbody>
          </table>
        </div>

        <div style={{marginTop:18,padding:15,borderRadius:12,background:"#f7fafc",fontSize:13,color:"#52627b"}}>
          <b>Carry Forward:</b> This month's final balance becomes the next month's previous balance.
          Negative balance means amount due from the employee; positive balance means amount remaining in the employee account.
        </div>
      </div>
    </div>
  );
}
