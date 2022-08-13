import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.home}>
      <div className={styles.section}>
        <Features />
        <Stats />
      </div>
    </div>
  );
};

function Features() {
  return (
    <div>
      <div className={styles.header}>
        <h3>Features</h3>
      </div>
      <div className={styles.body}>
        <div className={styles.feature}>Idle any game in your library</div>
        <div className={styles.feature}>Farm all your trading cards</div>
        <div className={styles.feature}>Activate free promo or free to play games</div>
        <div className={styles.feature}>Change nickname</div>
        <div className={styles.feature}>Change avatar</div>
        <div className={styles.feature}>Redeem cd-keys</div>

        <div className={styles.feature}>Change status (Invisible, Online, Away, Busy)</div>
        <div className={styles.feature}>Clear previous aliases</div>
        <div className={styles.feature}>Change privacy settings</div>
        <div className={styles.feature}>100% VAC safe (allowed by Valve)</div>
        <div className={styles.feature}>Multiple accounts support</div>
        <div className={styles.feature}>Account Auto-Restarter on disconnect</div>
        <div className={styles.feature}>Mobile auth / Email guard support</div>
        <div className={styles.feature}>One-click card farmer</div>
      </div>
    </div>
  );
}

function Stats() {
  return (
    <div className={styles.stats}>
      <div className={styles.header}>
        <h3>Site-wide Stats</h3>
      </div>
      <div className={styles.body}>
        <div className={styles.feature}>Total hours idled: ---</div>
      </div>
    </div>
  );
}

export default Home;
