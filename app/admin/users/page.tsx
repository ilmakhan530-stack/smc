 "use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { createManagedUser, db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

const modules = ["dashboard","attendance","staff","labour","salary","advance","thekedar","stock","bill","reports","users"] as const;
const actions = ["view","add","edit","delete"] as const;
type Permission = {view?:boolean;add?:boolean;edit?:boolean;delete?:boolean};
type ModuleKey = typeof modules[number];
type Permissions = Record<ModuleKey, Permission>;
type UserRow = {id:string;email?:string;name?:string;role?:string;enabled?:boolean;permissions?:Record<string,Permission>};

const blankPerms = (): Permissions =>
  Object.fromEntries(
    modules.map(m => [m, {view:false, add:false, edit:false, delete:false}])
  ) as Permissions;

export default function UserManagement(){
 const [users,setUsers]=useState<UserRow[]>([]);
 const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [name,setName]=useState(""); const [role,setRole]=useState("attendance");
 const [permissions,setPermissions]=useState<Permissions>(blankPerms());
 const [msg,setMsg]=useState(""); const [err,setErr]=useState(""); const [saving,setSaving]=useState(false);

 useEffect(()=>onSnapshot(collection(db,"users"),s=>setUsers(s.docs.map(d=>({id:d.id,...d.data()} as UserRow)))),[]);

 function toggle(m: ModuleKey, a: keyof Permission) {
  setPermissions(p => ({
    ...p,
    [m]: {
      ...p[m],
      [a]: !p[m][a]
    }
  }));
}
 async function create(){
   setMsg("");setErr("");
   if(!email||!password||password.length<6){setErr("Email aur minimum 6 character password dalo.");return;}
   setSaving(true);
   try{
     const u=await createManagedUser(email.trim(),password);
     await setDoc(doc(db,"users",u.uid),{email:email.trim(),name:name.trim(),role,enabled:true,permissions,createdAt:new Date().toISOString()});
     setEmail("");setPassword("");setName("");setRole("attendance");setPermissions(blankPerms());setMsg("User create ho gaya.");
   }catch(e:any){setErr(e?.message||"User create nahi hua.");} finally{setSaving(false);}
 }
 async function toggleEnabled(u:UserRow){await updateDoc(doc(db,"users",u.id),{enabled:u.enabled===false});}
 async function remove(u:UserRow){if(confirm(`Profile delete karein: ${u.email||u.id}?`)) await deleteDoc(doc(db,"users",u.id));}
 async function savePerm(u:UserRow,p:Record<string,Permission>){await updateDoc(doc(db,"users",u.id),{permissions:p});}

 return <AuthGuard allowedRoles={["admin"]}><div style={{display:"flex",minHeight:"100vh"}}><Sidebar/><main style={{flex:1,padding:28,background:"#f7faff"}}><div style={{maxWidth:1200,margin:"0 auto"}}>
  <h1 style={{margin:0,color:"#082b68"}}>User Management</h1><p style={{color:"#667085"}}>User ID, password, role aur module permissions.</p>
  <section className="card" style={{padding:20,marginTop:18}}>
   <h2 style={{marginTop:0}}>Create User</h2>
   <div style={{display:"grid",gridTemplateColumns:"1.2fr 1.5fr 1.2fr 1fr",gap:10}}>
    <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>
    <input className="input" placeholder="Login ID / Email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <input className="input" type="password" placeholder="Password (min 6)" value={password} onChange={e=>setPassword(e.target.value)}/>
    <select className="input" value={role} onChange={e=>setRole(e.target.value)}><option value="attendance">Attendance</option><option value="stock">Stock</option><option value="accounts">Accounts</option><option value="admin">Admin</option></select>
   </div>
   <div style={{marginTop:14,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}><thead><tr><th style={{textAlign:"left"}}>Module</th>{actions.map(a=><th key={a}>{a}</th>)}</tr></thead><tbody>
    {modules.map(m=><tr key={m} style={{borderTop:"1px solid #edf1f6"}}><td style={{padding:8,fontWeight:700,textTransform:"capitalize"}}>{m}</td>{actions.map(a=><td key={a} style={{textAlign:"center"}}><input type="checkbox" checked={!!permissions[m]?.[a]} onChange={()=>toggle(m,a)}/></td>)}</tr>)}
   </tbody></table></div>
   {err&&<p style={{color:"#c0392b"}}>{err}</p>}{msg&&<p style={{color:"#16824b"}}>{msg}</p>}
   <button className="btn btn-primary" disabled={saving} onClick={create}>{saving?"Creating…":"Create User"}</button>
  </section>
  <section className="card" style={{padding:20,marginTop:18}}><h2 style={{marginTop:0}}>Users</h2>
   {users.map(u=><div key={u.id} style={{borderTop:"1px solid #edf1f6",padding:"14px 0"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><b>{u.name||"—"}</b><div style={{fontSize:13,color:"#667085"}}>{u.email||u.id} · {u.role||"—"} · {u.enabled===false?"Disabled":"Active"}</div></div>
    <div style={{display:"flex",gap:8}}><button className="btn" onClick={()=>toggleEnabled(u)}>{u.enabled===false?"Enable":"Disable"}</button><button className="btn" onClick={()=>remove(u)}>Delete Profile</button></div></div>
    <div style={{marginTop:10,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}><thead><tr><th style={{textAlign:"left"}}>Module</th>{actions.map(a=><th key={a}>{a}</th>)}</tr></thead><tbody>
     {modules.map(m=><tr key={m}><td style={{padding:5,textTransform:"capitalize"}}>{m}</td>{actions.map(a=><td key={a} style={{textAlign:"center"}}><input type="checkbox" checked={!!u.permissions?.[m]?.[a]} onChange={async()=>{const p={...(u.permissions||blankPerms()),[m]:{...(u.permissions?.[m]||{}),[a]:!u.permissions?.[m]?.[a]}};setUsers(v=>v.map(x=>x.id===u.id?{...x,permissions:p}:x));await savePerm(u,p)}}/></td>)}</tr>)}
    </tbody></table></div>
   </div>)}
  </section>
 </div></main></div></AuthGuard>
}
