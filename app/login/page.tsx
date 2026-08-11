import Link from "next/link";
export default function Login(){
 return <main style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr"}}>
  <section style={{padding:"8%",background:"linear-gradient(145deg,#06245c,#1266e8)",color:"#fff",display:"flex",flexDirection:"column",justifyContent:"center"}}>
   <div style={{fontSize:30,fontWeight:900}}>🏢 SMC</div>
   <h1 style={{fontSize:48}}>Welcome to<br/>SMC Office Management</h1>
   <p style={{fontSize:18,lineHeight:1.7}}>Secure management for your office operations.</p>
   <p>✓ Secure & Reliable<br/>✓ Fast & Efficient<br/>✓ Real-time Reports</p>
  </section>
  <section style={{display:"flex",alignItems:"center",justifyContent:"center",padding:30}}>
   <div className="card" style={{width:"min(460px,100%)",padding:35}}>
    <div style={{textAlign:"center",fontSize:52}}>🏢</div><h2 style={{textAlign:"center",fontSize:30}}>Login to Your Account</h2>
    <p style={{textAlign:"center",color:"#667085"}}>Use the ID and password provided by Admin.</p>
    <label>Username / ID</label><input className="input" placeholder="Enter your ID"/>
    <br/><br/><label>Password</label><input className="input" type="password" placeholder="Enter password"/>
    <br/><br/><Link className="btn btn-primary" style={{display:"block",textAlign:"center"}} href="/dashboard">Login</Link>
    <p style={{textAlign:"center",fontSize:13,color:"#667085"}}>Public signup is disabled.</p>
   </div>
  </section>
 </main>
}