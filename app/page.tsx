import styles from "./home.module.css";

import Link from "next/link";

const clients = ["Indian Oil Corporation Limited (IOCL)", "Bharat Petroleum Corporation Limited (BPCL)", "Hindustan Petroleum Corporation Limited (HPCL)"];
const commitments = ["High-quality LPG regulators", "Reliable and consistent performance", "Safe and durable products", "Precision manufacturing", "Competitive pricing", "Timely supply", "Professional customer support"];

export default function Home() {
  return (
    <main className={styles.home}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <img src="/smc-logo.jpg" alt="Shivansh Machinery Co. logo" />
          <div><b>SHIVANSH MACHINERY CO. (L.L.P.)</b><span>LPG REGULATOR MANUFACTURER</span></div>
        </Link>
        <Link href="/login" className={styles.loginBtn}>Login</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>QUALITY • TRUST • SERVICE</div>
          <h1>Precision LPG Regulators.<br /><span>Built for Safety & Reliability.</span></h1>
          <p>Shivansh Machinery Co. (L.L.P.) is a Meerut, Uttar Pradesh-based manufacturer specializing in LPG Regulators and related LPG gas-control products.</p>
          <div className={styles.chips}><span>Precision Manufacturing</span><span>Safe Pressure Regulation</span><span>Consistent Performance</span></div>
        </div>
        <div className={styles.heroProduct}><div className={styles.ring}><div className={styles.regulator}>LPG<br /><strong>REGULATOR</strong></div></div></div>
      </section>

      <section id="about" className="about section">
        <div><div className={styles.eyebrow}>ABOUT SHIVANSH MACHINERY CO.</div><h2>Manufacturing with <span>purpose and precision.</span></h2></div>
        <div className={styles.copy}><p>Shivansh Machinery Co. (L.L.P.) manufactures quality-focused LPG regulators designed for safe, reliable and efficient LPG pressure regulation.</p><p>Our products are developed with emphasis on precision, durability, safety and consistent performance.</p></div>
      </section>

      <section className="clients section">
        <div className={styles.eyebrow}>LPG REGULATORS FOR MAJOR OIL MARKETING COMPANIES</div>
        <h2>Serving requirements associated with leading OMCs</h2>
        <div className={styles.clientGrid}>{clients.map((c, i) => <div className={styles.clientCard} key={c}><div className={styles.clientNo}>0{i+1}</div><b>{c}</b><small>Quality-focused LPG regulator applications</small></div>)}</div>
        <p className={styles.note}>Our manufacturing approach focuses on applicable specifications, quality requirements and regulatory standards relevant to LPG regulator products.</p>
      </section>

      <section id="quality" className="quality section">
        <div className={styles.qualityText}><div className={styles.eyebrow}>QUALITY & SAFETY</div><h2>Safety is at the <span>heart of manufacturing.</span></h2><p>We focus on material quality, dimensional accuracy, pressure regulation performance, durability and product consistency.</p><p>The company follows applicable Bureau of Indian Standards (BIS) and relevant regulatory requirements for LPG regulator products.</p></div>
        <div className={styles.qualityCards}><div><b>01</b><h3>Material Quality</h3><p>Focused material selection and production control.</p></div><div><b>02</b><h3>Dimensional Accuracy</h3><p>Precision-focused manufacturing for consistent products.</p></div><div><b>03</b><h3>Performance</h3><p>Reliable pressure regulation and durability.</p></div><div><b>04</b><h3>Consistency</h3><p>Quality checks supporting dependable supply.</p></div></div>
      </section>

      <section className="commit section"><div><div className={styles.eyebrow}>OUR COMMITMENT</div><h2>Dependable products. Professional service.</h2></div><div className={styles.commitGrid}>{commitments.map(x => <div key={x}>✓ {x}</div>)}</div></section>

      <section className="vision section"><div className={styles.eyebrow}>OUR VISION</div><h2>To become a <span>trusted and dependable name</span> in the LPG regulator manufacturing industry.</h2><p>Serving the requirements of leading oil marketing companies and their associated LPG distribution networks through quality manufacturing and continuous improvement.</p></section>

      <footer id="contact"><div className={styles.footerBrand}><img src="/smc-logo.jpg" alt="SMC logo"/><div><b>Shivansh Machinery Co. (L.L.P.)</b><span>93, Jamna Nagar, Hapur Road, Meerut, Uttar Pradesh</span></div></div><div className={styles.footerTag}>Quality • Trust • Service</div></footer>
    </main>
  );
}
