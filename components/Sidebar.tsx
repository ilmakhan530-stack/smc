import Link from "next/link";
import { LayoutDashboard, Users, UserRound, CalendarCheck, WalletCards, HardHat, WalletMinimal, Package, Handshake, ReceiptIndianRupee, BarChart3 } from "lucide-react";

const items:any[]=[
  ["Dashboard","/dashboard",LayoutDashboard],
  ["Labour","/labour",Users],
  ["Staff","/staff",UserRound],
  ["Attendance","/attendance",CalendarCheck],
  ["Salary","/salary",WalletCards],
  ["Advance","/advance",WalletMinimal],
  ["Thekedar Work","/thekedar",HardHat],
  ["Stock","#",Package],
  ["Party","#",Handshake],
  ["Expenses","#",ReceiptIndianRupee],
  ["Reports","/reports",BarChart3]
];

export default function Sidebar(){
  return <aside style={{width:235,minHeight:"100vh",background:"linear-gradient(180deg,#062657,#0a3d78)",color:"#fff",padding:18,position:"sticky",top:0,flexShrink:0}}>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 8px 28px",borderBottom:"1px solid #ffffff22",marginBottom:18}}>
      <div style={{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",background:"#fff",color:"#0a3472",border:"4px solid #43ad72",fontWeight:900}}>SMC</div>
      <div><b style={{fontSize:16}}>SMC</b><small style={{display:"block",fontSize:9,color:"#75cf99",letterSpacing:1}}>ADMIN PANEL</small></div>
    </div>
    {items.map(([n,h,I])=><Link key={n} href={h} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 12px",borderRadius:10,margin:"4px 0",color:"#e9f1fb",textDecoration:"none",fontSize:13,fontWeight:700}}>
      <I size={17}/>{n}
    </Link>)}
  </aside>
}
