"use client";
import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login(){
 const router=useRouter();
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault(); setError(""); setLoading(true);
  try{
   const cred=await signInWithEmailAndPassword(auth,email,password);
   const snap=await getDoc(doc(db,"users",cred.user.uid));
   const role=snap.data()?.role || "attendance";
   router.replace(role === "attendance" ? "/attendance" : "/dashboard");
  catch(err:any){
  console.log("LOGIN ERROR:", err);
  setError(err?.code || err?.message || "Login failed");
  }
  }finally{setLoading(false);}
 }
 return <main style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr"}}>
  <section style={{padding:"8%",background:"linear-gradient(145deg,#06245c,#1266e8)",color:"#fff",display:"flex",flexDirection:"column",justifyContent:"center"}}>
   <div style={{fontSize:30,fontWeight:900}}>🏢 SMC</div><h1 style={{fontSize:48}}>Welcome to<br/>SMC Office Management</h1>
   <p style={{fontSize:18,lineHeight:1.7}}>Secure management for your office operations.</p><p>✓ Secure & Reliable<br/>✓ Role-based access<br/>✓ No public signup</p>
  </section>
  <section style={{display:"flex",alignItems:"center",justifyContent:"center",padding:30}}>
   <form onSubmit={submit} className="card" style={{width:"min(460px,100%)",padding:35}}>
    <div style={{textAlign:"center",fontSize:52}}>🏢</div><h2 style={{textAlign:"center",fontSize:30}}>Login to Your Account</h2>
    <p style={{textAlign:"center",color:"#667085"}}>Use the ID and password provided by Admin.</p>
    <label>Email / Login ID</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" autoComplete="username" required/>
    <br/><br/><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" required/>
    {error && <p style={{color:"#d92d20",fontSize:14}}>{error}</p>}
    <br/><button className="btn btn-primary" style={{width:"100%"}} disabled={loading}>{loading?"Signing in…":"Login"}</button>
    <p style={{textAlign:"center",fontSize:13,color:"#667085"}}>Public signup is disabled.</p>
   </form>
  </section>
 </main>
}
