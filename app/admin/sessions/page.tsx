"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import { LogOut, RefreshCw } from "lucide-react";

function SessionPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "activeSessions"), orderBy("lastSeen", "desc"));
    return onSnapshot(q, snap => setRows(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  async function logout(id: string) {
    setBusy(id);
    try { await updateDoc(doc(db, "activeSessions", id), { forceLogout: true }); }
    finally { setBusy(""); }
  }

  const online = rows.filter(r => r.online && Date.now() - Number(r.lastSeen || 0) < 60000);

  return <main style={{padding:28,background:"#f6f9ff",minHeight:"100vh",fontFamily:"Arial"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <div><div style={{color:"#2eaa69",fontWeight:900,letterSpacing:2,fontSize:12}}>ADMIN PANEL</div><h1 style={{margin:"7px 0",color:"#092f6c"}}>User Activity & Sessions</h1><p style={{color:"#66778b"}}>Dekho kis User ID se kaunsa page khula hai aur zarurat par user ko logout karo.</p></div>
      <div style={{background:"#fff",padding:"12px 18px",borderRadius:12,border:"1px solid #dce6f0",fontWeight:800}}>Online: {online.length}</div>
    </div>
    <section style={{background:"#fff",borderRadius:16,border:"1px solid #dce6f0",overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"1.4fr .8fr 1fr 1.3fr 1fr .8fr",gap:10,padding:14,fontWeight:900,color:"#45607b",background:"#f3f7fb",fontSize:13}}><div>User ID / Email</div><div>Role</div><div>Status</div><div>Current Page</div><div>Last Seen</div><div>Action</div></div>
      {rows.length===0 && <div style={{padding:28,color:"#77899b"}}>Abhi koi session record nahi hai.</div>}
      {rows.map(r => {
        const isOnline = !!r.online && Date.now() - Number(r.lastSeen || 0) < 60000;
        return <div key={r.id} style={{display:"grid",gridTemplateColumns:"1.4fr .8fr 1fr 1.3fr 1fr .8fr",gap:10,padding:15,borderTop:"1px solid #edf2f7",alignItems:"center",fontSize:13}}>
          <div><b>{r.email || r.uid}</b><small style={{display:"block",color:"#8998a8",marginTop:4}}>{r.uid}</small></div>
          <div style={{textTransform:"capitalize"}}>{r.role || "—"}</div>
          <div><span style={{display:"inline-block",padding:"5px 9px",borderRadius:20,background:isOnline?"#e9f8ef":"#f0f2f5",color:isOnline?"#168246":"#697786",fontWeight:800}}>{isOnline?"Online":"Offline"}</span></div>
          <div style={{fontWeight:700,color:"#274765"}}>{r.currentPath || "—"}</div>
          <div style={{color:"#66778b"}}>{r.lastSeen ? new Date(Number(r.lastSeen)).toLocaleString() : "—"}</div>
          <button onClick={()=>logout(r.id)} disabled={busy===r.id || !isOnline} style={{border:0,borderRadius:9,padding:"9px 10px",background:isOnline?"#d9363e":"#e5e9ee",color:isOnline?"#fff":"#8793a0",fontWeight:900,cursor:isOnline?"pointer":"not-allowed",display:"inline-flex",gap:6,alignItems:"center"}}><LogOut size={14}/>{busy===r.id?"...":"Logout"}</button>
        </div>
      })}
    </section>
  </main>
}

export default function AdminSessionsPage(){
  return <AuthGuard allowedRoles={["admin"]}><SessionPanel/></AuthGuard>;
}
