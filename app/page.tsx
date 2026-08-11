import Link from "next/link";
export default function Home(){
  return <main>
    <header style={{height:82,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%",background:"#fff",borderBottom:"1px solid #e5ecf7"}}>
      <div style={{fontWeight:900,fontSize:25,color:"#0a3478"}}>🏢 SMC <span style={{fontSize:15}}>OFFICE MANAGEMENT SYSTEM</span></div>
      <Link className="btn btn-primary" href="/login">Login</Link>
    </header>
    <section style={{minHeight:430,padding:"70px 7%",display:"flex",alignItems:"center",gap:40,background:"linear-gradient(120deg,#eef6ff,#fff)"}}>
      <div style={{flex:1}}><h1 style={{fontSize:48,margin:"0 0 18px",color:"#082b68"}}>SMC Office<br/>Management System</h1>
      <p style={{fontSize:18,lineHeight:1.7}}>Complete digital solution for Labour, Staff, Attendance, Salary, Stock, Parties, Expenses and Reports.</p>
      <Link className="btn btn-primary" href="/login">Secure Login →</Link></div>
      <div className="card" style={{flex:1,height:300,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,background:"linear-gradient(135deg,#dcecff,#fff)"}}>🏢</div>
    </section>
    <section style={{padding:"35px 7%",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
      {[
        ["About Our Company","Smart, secure and efficient office management in one place."],
        ["Our Mission","Make daily office operations faster, accurate and paperless."],
        ["Our Vision","Build a reliable digital system that grows with the business."]
      ].map(([t,d])=><div className="card" style={{padding:25}} key={t}><h2 style={{color:"#1266e8"}}>{t}</h2><p>{d}</p></div>)}
    </section>
    <footer style={{padding:25,textAlign:"center",background:"#082b68",color:"#fff"}}>© 2026 SMC Office Management System · Version 0.4.0</footer>
  </main>
}