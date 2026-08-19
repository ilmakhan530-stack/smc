"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LayoutDashboard, Users, UserRound, CalendarCheck, WalletCards, HardHat, WalletMinimal, Package, Handshake, ReceiptIndianRupee, BarChart3 } from "lucide-react";
import { hasModulePermission, PermissionKey, UserRole } from "@/components/AuthGuard";

const items: Array<[string, string, any, PermissionKey | "admin"]> = [
  ["Dashboard","/dashboard",LayoutDashboard,"dashboard"],
  ["Labour","/labour",Users,"labour"],
  ["Staff","/staff",UserRound,"staff"],
  ["Attendance","/attendance",CalendarCheck,"attendance"],
  ["Salary","/salary",WalletCards,"salary"],
  ["Advance","/advance",WalletMinimal,"advance"],
  ["Thekedar Work","/thekedar",HardHat,"thekedar"],
  ["Bill / Tax Invoice","/bill",ReceiptIndianRupee,"bill"],
  ["Stock","/stock",Package,"stock"],
  ["Party","#",Handshake,"admin"],
  ["Expenses","#",ReceiptIndianRupee,"admin"],
  ["Reports","/reports",BarChart3,"reports"],
  ["User Management","/admin/users",Users,"admin"],
  ["User Activity","/admin/sessions",Users,"admin"],
];

export default function Sidebar(){
  const [role, setRole] = useState<UserRole>();
  const [permissions, setPermissions] = useState<Record<string, boolean> | undefined>();
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (!user) { setRole(undefined); setPermissions(undefined); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data() || {};
      setRole((data.role || "attendance") as UserRole);
      setPermissions(data.permissions && typeof data.permissions === "object" ? data.permissions : undefined);
      setConfigured(!!data.permissions && typeof data.permissions === "object");
    });
  }, []);

  const visible = items.filter(([, , , key]) => {
    if (key === "admin") return role === "admin";
    return hasModulePermission(role, permissions, key, configured);
  });

  return <aside style={{width:235,minHeight:"100vh",background:"linear-gradient(180deg,#062657,#0a3d78)",color:"#fff",padding:18,position:"sticky",top:0,flexShrink:0}}>
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 8px 28px",borderBottom:"1px solid #ffffff22",marginBottom:18}}>
      <div style={{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",background:"#fff",color:"#0a3472",border:"4px solid #43ad72",fontWeight:900}}>SMC</div>
      <div><b style={{fontSize:16}}>SMC</b><small style={{display:"block",fontSize:9,color:"#75cf99",letterSpacing:1}}>ADMIN PANEL</small></div>
    </div>
    {visible.map(([n,h,I])=><Link key={n} href={h} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 12px",borderRadius:10,margin:"4px 0",color:"#e9f1fb",textDecoration:"none",fontSize:13,fontWeight:700}}>
      <I size={17}/>{n}
    </Link>)}
  </aside>
}
