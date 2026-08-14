import Link from "next/link";

const clients = ["Indian Oil Corporation Limited (IOCL)", "Bharat Petroleum Corporation Limited (BPCL)", "Hindustan Petroleum Corporation Limited (HPCL)"];
const commitments = ["High-quality LPG regulators", "Reliable and consistent performance", "Safe and durable products", "Precision manufacturing", "Competitive pricing", "Timely supply", "Professional customer support"];

export default function Home() {
  return (
    <main className="home">
      <header className="header">
        <Link href="/" className="brand">
          <img src="/smc-logo.jpg" alt="Shivansh Machinery Co. logo" />
          <div><b>SHIVANSH MACHINERY CO. (L.L.P.)</b><span>LPG REGULATOR MANUFACTURER</span></div>
        </Link>
        <Link href="/login" className="loginBtn">Login</Link>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow">QUALITY • TRUST • SERVICE</div>
          <h1>Precision LPG Regulators.<br /><span>Built for Safety & Reliability.</span></h1>
          <p>Shivansh Machinery Co. (L.L.P.) is a Meerut, Uttar Pradesh-based manufacturer specializing in LPG Regulators and related LPG gas-control products.</p>
          <div className="chips"><span>Precision Manufacturing</span><span>Safe Pressure Regulation</span><span>Consistent Performance</span></div>
        </div>
        <div className="heroProduct"><div className="ring"><div className="regulator">LPG<br /><strong>REGULATOR</strong></div></div></div>
      </section>

      <section id="about" className="about section">
        <div><div className="eyebrow">ABOUT SHIVANSH MACHINERY CO.</div><h2>Manufacturing with <span>purpose and precision.</span></h2></div>
        <div className="copy"><p>Shivansh Machinery Co. (L.L.P.) manufactures quality-focused LPG regulators designed for safe, reliable and efficient LPG pressure regulation.</p><p>Our products are developed with emphasis on precision, durability, safety and consistent performance.</p></div>
      </section>

      <section className="clients section">
        <div className="eyebrow">LPG REGULATORS FOR MAJOR OIL MARKETING COMPANIES</div>
        <h2>Serving requirements associated with leading OMCs</h2>
        <div className="clientGrid">{clients.map((c, i) => <div className="clientCard" key={c}><div className="clientNo">0{i+1}</div><b>{c}</b><small>Quality-focused LPG regulator applications</small></div>)}</div>
        <p className="note">Our manufacturing approach focuses on applicable specifications, quality requirements and regulatory standards relevant to LPG regulator products.</p>
      </section>

      <section id="quality" className="quality section">
        <div className="qualityText"><div className="eyebrow">QUALITY & SAFETY</div><h2>Safety is at the <span>heart of manufacturing.</span></h2><p>We focus on material quality, dimensional accuracy, pressure regulation performance, durability and product consistency.</p><p>The company follows applicable Bureau of Indian Standards (BIS) and relevant regulatory requirements for LPG regulator products.</p></div>
        <div className="qualityCards"><div><b>01</b><h3>Material Quality</h3><p>Focused material selection and production control.</p></div><div><b>02</b><h3>Dimensional Accuracy</h3><p>Precision-focused manufacturing for consistent products.</p></div><div><b>03</b><h3>Performance</h3><p>Reliable pressure regulation and durability.</p></div><div><b>04</b><h3>Consistency</h3><p>Quality checks supporting dependable supply.</p></div></div>
      </section>

      <section className="commit section"><div><div className="eyebrow">OUR COMMITMENT</div><h2>Dependable products. Professional service.</h2></div><div className="commitGrid">{commitments.map(x => <div key={x}>✓ {x}</div>)}</div></section>

      <section className="vision section"><div className="eyebrow">OUR VISION</div><h2>To become a <span>trusted and dependable name</span> in the LPG regulator manufacturing industry.</h2><p>Serving the requirements of leading oil marketing companies and their associated LPG distribution networks through quality manufacturing and continuous improvement.</p></section>

      <footer id="contact"><div className="footerBrand"><img src="/smc-logo.jpg" alt="SMC logo"/><div><b>Shivansh Machinery Co. (L.L.P.)</b><span>93, Jamna Nagar, Hapur Road, Meerut, Uttar Pradesh</span></div></div><div className="footerTag">Quality • Trust • Service</div></footer>

      <style jsx>{`
        *{box-sizing:border-box}.home{font-family:Arial,Helvetica,sans-serif;color:#10243e;background:#fff}.header{height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 6%;border-bottom:1px solid #e4ebf3;background:#fff;position:sticky;top:0;z-index:20}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#0a3472}.brand img{width:52px;height:52px;object-fit:contain;border-radius:50%}.brand b{display:block;font-size:14px}.brand span{display:block;color:#39a76b;font-size:9px;letter-spacing:1.5px;margin-top:4px}.loginBtn{background:#0a3472;color:#fff;text-decoration:none;padding:12px 25px;border-radius:9px;font-weight:800}.hero{min-height:600px;padding:65px 8%;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;background:linear-gradient(125deg,#f3f8fd,#fff)}.eyebrow{color:#32a66b;font-size:11px;font-weight:900;letter-spacing:2px}.hero h1{font-size:55px;line-height:1.07;color:#082f6b;margin:16px 0}.hero h1 span,h2 span{color:#31a76a}.hero p{font-size:18px;line-height:1.8;color:#5d6e83;max-width:650px}.chips{display:flex;gap:9px;flex-wrap:wrap;margin-top:28px}.chips span{padding:10px 13px;border-radius:20px;background:#e8f3ed;color:#24794d;font-size:12px;font-weight:700}.heroProduct{display:grid;place-items:center}.ring{width:350px;height:350px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fff 0 28%,#dcefe4 29% 55%,#eaf2fb 56%);box-shadow:0 25px 75px #b9c9db}.regulator{width:190px;height:130px;border-radius:28px;background:linear-gradient(145deg,#d9e0e6,#ffffff);box-shadow:inset 0 0 0 5px #9ba9b7,0 20px 35px #8799ab66;display:grid;place-items:center;text-align:center;color:#153c70;font-size:22px}.regulator strong{font-size:12px;letter-spacing:2px}.section{padding:85px 8%}.about{display:grid;grid-template-columns:1fr 1fr;gap:70px}.section h2{font-size:40px;color:#082f6b;margin:14px 0 22px}.copy,.note,.qualityText p,.vision p{font-size:17px;line-height:1.8;color:#5d6e83}.clients{background:#f5f8fc}.clientGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:35px}.clientCard{background:#fff;border:1px solid #e0e8f1;border-radius:16px;padding:25px;box-shadow:0 12px 30px #dbe5ef}.clientNo{color:#38a76d;font-weight:900;font-size:12px;margin-bottom:25px}.clientCard b{display:block;color:#123c70;font-size:17px;line-height:1.45}.clientCard small{display:block;color:#74849a;margin-top:15px;line-height:1.5}.note{margin-top:30px;font-size:14px}.quality{display:grid;grid-template-columns:1fr 1fr;gap:70px}.qualityCards{display:grid;grid-template-columns:1fr 1fr;gap:16px}.qualityCards div{padding:23px;border:1px solid #e0e8f1;border-radius:14px}.qualityCards b{color:#38a76d}.qualityCards h3{color:#0a3472}.qualityCards p{color:#6a7a8e;line-height:1.6;font-size:14px}.commit{display:grid;grid-template-columns:1fr 1fr;gap:70px;background:#edf6f0}.commitGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.commitGrid div{padding:13px;background:#fff;border-radius:9px;color:#31516e;font-size:14px}.vision{background:#082e69;color:#fff}.vision h2{color:#fff;max-width:900px}.vision p{color:#d7e3f0;max-width:850px}.vision .eyebrow{color:#66c78b}footer{padding:42px 8%;background:#062657;color:#fff;display:flex;justify-content:space-between;align-items:center}.footerBrand{display:flex;gap:14px;align-items:center}.footerBrand img{width:52px;height:52px;object-fit:contain;border-radius:50%}.footerBrand b{display:block}.footerBrand span{display:block;color:#cbd8e8;font-size:13px;margin-top:7px}.footerTag{color:#68c78d;font-weight:800}@media(max-width:800px){nav{display:none}.hero,.about,.quality,.commit{display:block}.hero h1{font-size:40px}.heroProduct{margin-top:45px}.ring{width:280px;height:280px}.clientGrid{grid-template-columns:1fr}.qualityCards{margin-top:30px}.commitGrid{margin-top:30px}.footerTag{margin-top:20px}footer{display:block}}
      `}</style>
    </main>
  );
}
