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
        <div className={styles.heroProduct}>
          <div className={styles.productImageWrap}>
            <img src="/lpg-regulators-omc.png" alt="IndianOil, Bharat Petroleum and HPCL LPG regulators" className={styles.productImage} />
            <div className={styles.productCaption}>LOW PRESSURE LPG REGULATOR</div>
          </div>
        </div>
      </section>

      <section id="products" className={`${styles.products} ${styles.section}`}>
        <div className={styles.productShowcase}>
          <div className={styles.productPhotoCard}>
            <img src="/lpg-regulators-omc.png" alt="LPG regulators for major oil marketing companies" />
          </div>
          <div className={styles.productInfo}>
            <div className={styles.eyebrow}>OUR LPG REGULATOR</div>
            <h2>Reliable pressure regulation for <span>safe LPG use.</span></h2>
            <p>Our LPG regulators are designed with a focus on safe pressure regulation, dependable operation, durability and consistent performance.</p>
            <div className={styles.productPoints}>
              <div>✓ Low Pressure Regulation</div>
              <div>✓ Durable Construction</div>
              <div>✓ Consistent Performance</div>
              <div>✓ Quality-Focused Manufacturing</div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className={`${styles.about} ${styles.section}`}>
        <div className={styles.aboutHeading}>
          <div className={styles.eyebrow}>ABOUT SHIVANSH MACHINERY CO.</div>
          <h2>Manufacturing with <span>purpose and precision.</span></h2>
          <div className={styles.aboutStats}>
            <div><strong>QUALITY</strong><span>Focused manufacturing</span></div>
            <div><strong>SAFETY</strong><span>Reliable pressure control</span></div>
            <div><strong>SUPPLY</strong><span>Professional service</span></div>
          </div>
        </div>
        <div className={styles.aboutVisual}>
          <div className={styles.aboutPanel}>
            <img src="/lpg-regulators-omc.png" alt="SMC LPG regulator products" />
            <div className={styles.aboutPanelText}><b>LPG REGULATOR MANUFACTURER</b><span>Precision • Safety • Reliability</span></div>
          </div>
          <div className={styles.copy}><p>Shivansh Machinery Co. (L.L.P.) manufactures quality-focused LPG regulators designed for safe, reliable and efficient LPG pressure regulation.</p><p>Our products are developed with emphasis on precision, durability, safety and consistent performance.</p></div>
        </div>
      </section>

      <section className={`${styles.clients} ${styles.section}`}>
        <div className={styles.eyebrow}>OUR LPG REGULATOR APPLICATIONS</div>
        <h2>Regulators for leading oil marketing companies</h2>
        <div className={styles.companyGrid}>
          <div className={styles.companyCard}>
            <div className={styles.companyLogoWrap}><img src="/indianoil-logo.jpg" alt="IndianOil logo" className={styles.companyLogo} /></div>
            <img src="/indianoil-regulator.jpg" alt="IndianOil LPG regulator" />
            <div className={styles.companyBody}><div className={styles.companyNo}>01</div><h3>IndianOil</h3><b>Indian Oil Corporation Limited (IOCL)</b><p>LPG regulator applications associated with IndianOil domestic LPG products.</p></div>
          </div>
          <div className={styles.companyCard}>
            <div className={styles.companyLogoWrap}><img src="/bpcl-logo.jpg" alt="Bharat Petroleum logo" className={styles.companyLogo} /></div>
            <img src="/bpcl-regulator.jpg" alt="Bharat Petroleum LPG regulator" />
            <div className={styles.companyBody}><div className={styles.companyNo}>02</div><h3>Bharat Petroleum</h3><b>Bharat Petroleum Corporation Limited (BPCL)</b><p>LPG regulator applications associated with Bharatgas LPG products.</p></div>
          </div>
          <div className={styles.companyCard}>
            <div className={styles.companyLogoWrap}><img src="/hpcl-logo.jpg" alt="Hindustan Petroleum logo" className={styles.companyLogo} /></div>
            <img src="/hpcl-regulator.jpg" alt="HPCL LPG regulator" />
            <div className={styles.companyBody}><div className={styles.companyNo}>03</div><h3>Hindustan Petroleum</h3><b>Hindustan Petroleum Corporation Limited (HPCL)</b><p>LPG regulator applications associated with HP Gas LPG products.</p></div>
          </div>
        </div>
        <p className={styles.note}>Our manufacturing approach focuses on applicable specifications, quality requirements and regulatory standards relevant to LPG regulator products.</p>
      </section>

      <section id="quality" className={`${styles.quality} ${styles.section}`}>
        <div className={styles.qualityText}><div className={styles.eyebrow}>QUALITY & SAFETY</div><h2>Safety is at the <span>heart of manufacturing.</span></h2><p>We focus on material quality, dimensional accuracy, pressure regulation performance, durability and product consistency.</p><p>The company follows applicable Bureau of Indian Standards (BIS) and relevant regulatory requirements for LPG regulator products.</p></div>
        <div className={styles.qualityCards}><div><b>01</b><h3>Material Quality</h3><p>Focused material selection and production control.</p></div><div><b>02</b><h3>Dimensional Accuracy</h3><p>Precision-focused manufacturing for consistent products.</p></div><div><b>03</b><h3>Performance</h3><p>Reliable pressure regulation and durability.</p></div><div><b>04</b><h3>Consistency</h3><p>Quality checks supporting dependable supply.</p></div></div>
      </section>

      <section className={`${styles.commit} ${styles.section}`}><div><div className={styles.eyebrow}>OUR COMMITMENT</div><h2>Dependable products. Professional service.</h2></div><div className={styles.commitGrid}>{commitments.map(x => <div key={x}>✓ {x}</div>)}</div></section>

      <section className={`${styles.vision} ${styles.section}`}><div className={styles.eyebrow}>OUR VISION</div><h2>To become a <span>trusted and dependable name</span> in the LPG regulator manufacturing industry.</h2><p>Serving the requirements of leading oil marketing companies and their associated LPG distribution networks through quality manufacturing and continuous improvement.</p></section>

      <footer id="contact" className={styles.footer}><div className={styles.footerBrand}><img src="/smc-logo.jpg" alt="SMC logo"/><div><b>Shivansh Machinery Co. (L.L.P.)</b><span>93, Jamna Nagar, Hapur Road, Meerut, Uttar Pradesh</span></div></div><div className={styles.footerTag}>Quality • Trust • Service</div></footer>
    </main>
  );
}
