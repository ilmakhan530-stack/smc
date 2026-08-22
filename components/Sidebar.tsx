"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { hasPermission, type PermissionKey, type UserPermissions } from "@/lib/access";
import {
  LayoutDashboard, Users, UserRound, CalendarCheck, WalletCards,
  HardHat, WalletMinimal, Package, Handshake, ReceiptIndianRupee,
  BarChart3, LogOut
} from "lucide-react";

const items: Array<[string,string,any,PermissionKey|null]> = [
  ["Dashboard","/dashboard",LayoutDashboard,"dashboard"],
  ["Labour","/labour",Users,"labour"],
  ["Staff","/staff",UserRound,"staff"],
  ["Attendance","/attendance",CalendarCheck,"attendance"],
  ["Salary","/salary",WalletCards,"salary"],
  ["Advance","/advance",WalletMinimal,"advance"],
  ["Thekedar Work","/thekedar",HardHat,"thekedar"],
  ["Bill","/bill",ReceiptIndianRupee,"bill"],
  ["Stock","/stock",Package,"stock"],
  ["Party","#",Handshake,null],
  ["Expenses","#",ReceiptIndianRupee,null],
  ["Reports","/reports",BarChart3,"reports"],
];

export default function Sidebar(){
  const router = useRouter();
  const [role,setRole]=useState<string>();
  const [permissions,setPermissions]=useState<UserPermissions>();

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if(!user) return;
      try {
        const snap=await getDoc(doc(db,"users",user.uid));
        const data=snap.data() || {};
        setRole(data.role);
        setPermissions(data.permissions || {});
      } catch(e) {
        console.error("Sidebar permission check failed",e);
      }
    });
  },[]);

  const can=(module:PermissionKey|null)=>
    module===null ? false : hasPermission(role,permissions,module);
  const admin=role==="admin" || role==="Admin";

  async function logout(){
    try {
      await signOut(auth);
    } finally {
      router.replace("/login");
    }
  }

  return (
    <aside style={{
      width:235,minHeight:"100vh",background:"linear-gradient(180deg,#062657,#0a3d78)",
      color:"#fff",padding:18,position:"sticky",top:0,flexShrink:0,
      display:"flex",flexDirection:"column",boxSizing:"border-box"
    }}>
      <div>
        <div style={{
          display:"flex",alignItems:"center",gap:10,padding:"8px 8px 28px",
          borderBottom:"1px solid #ffffff22",marginBottom:18
        }}>
          <div style={{
            width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",
            background:"#fff",color:"#0a3472",border:"4px solid #43ad72",
            fontWeight:900,flexShrink:0
          }}>SMC</div>
          <div>
            <b style={{fontSize:16}}>SMC</b>
            <small style={{display:"block",fontSize:9,color:"#75cf99",letterSpacing:1}}>
              OFFICE MANAGEMENT
            </small>
          </div>
        </div>

        {items.filter(([, , , module])=>admin || can(module)).map(([n,h,I])=>
          <Link key={n} href={h} style={{
            display:"flex",alignItems:"center",gap:11,padding:"11px 12px",
            borderRadius:10,margin:"4px 0",color:"#e9f1fb",
            textDecoration:"none",fontSize:13,fontWeight:700
          }}>
            <I size={17}/>{n}
          </Link>
        )}

        {admin && <>
          <Link href="/admin/users" style={{
            display:"flex",alignItems:"center",gap:11,padding:"11px 12px",
            borderRadius:10,margin:"4px 0",color:"#e9f1fb",
            textDecoration:"none",fontSize:13,fontWeight:700
          }}>
            <Users size={17}/>User Management
          </Link>
          <Link href="/admin/sessions" style={{
            display:"flex",alignItems:"center",gap:11,padding:"11px 12px",
            borderRadius:10,margin:"4px 0",color:"#e9f1fb",
            textDecoration:"none",fontSize:13,fontWeight:700
          }}>
            <Users size={17}/>User Activity
          </Link>
        </>}
      </div>

      <button
        type="button"
        onClick={logout}
        style={{
          marginTop:"auto",width:"100%",border:"1px solid #ffffff35",
          borderRadius:10,padding:"11px 12px",background:"#ffffff12",
          color:"#fff",fontWeight:800,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8
        }}
      >
        <LogOut size={17}/> Logout
      </button>
    </aside>
  );
}
