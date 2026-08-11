import Link from "next/link";
export default function Sidebar(){
 const items=[["Dashboard","/dashboard"],["Labour","/labour"],["Staff","#"],["Attendance","/attendance"],["Salary","#"],["Thekedar Work","/thekedar"],["Stock","#"],["Party","#"],["Expenses","#"],["Reports","#"]];
 return <aside style={{width:235,minHeight:"100vh",background:"#082b68",color:"#fff",padding:20,position:"sticky",top:0}}>
  <div style={{fontSize:25,fontWeight:900,marginBottom:35}}>🏢 SMC</div>
  {items.map(([n,h])=><Link key={n} href={h} style={{display:"block",padding:"13px 14px",borderRadius:10,margin:"5px 0"}}>{n}</Link>)}
 </aside>
}