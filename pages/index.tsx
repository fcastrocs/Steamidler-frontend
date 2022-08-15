import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import React from "react";

const Home: NextPage = () => {
  return (
    <>
      <div className={styles.home}>
        <div className={styles.section}>
          <div className={styles.sectionName}>Features</div>
          <div className={styles.sectionBody}>
            <Features />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionName}>Server Status</div>
          <div className={styles.sectionBody}>
            <ServerStatus />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionName}>Stats</div>
          <div className={styles.sectionBody}>
            <Stats />
          </div>
        </div>
      </div>
    </>
  );
};

function Features() {
  return (
    <>
      <div className={styles.item}>
        <div className={styles.header}>🎮</div>
        <div className={styles.content}>Idle up to 32 games from your library at a time.</div>
      </div>
      <div className={styles.item}>
        <div className={styles.header}>🧑‍🌾</div>
        <div className={styles.content}>Farm all your trading cards with a single click.</div>
      </div>
      <div className={styles.item}>
        <div className={styles.header}>⚙️</div>
        <div className={styles.content}>
          <div>Change avatar, persona, privacy, nickname.</div>
          <div>Redeem cd-keys.</div>
          <div>Add any free to play game.</div>
          <div>Clear previous aliases.</div>
          <div>Send trade offers.</div>
        </div>
      </div>

      <div className={styles.item}>
        <div className={styles.header}>🌐</div>
        <div className={styles.content}>
          <div>No Vac bans because Valve acknowledges idling. </div>
          <div>Support for 2FA and email Steam Guard.</div>
          <div>Auto-restard account on disconnect.</div>
        </div>
      </div>
    </>
  );
}

function ServerStatus() {
  return (
    <div className={styles.serverBody}>
      <h4>Updates every 5 mins</h4>
      <div className={styles.item}>
        <div className={styles.header}>📊</div>
        <div className={styles.content + " " + styles.servers}>
          <div>
            <div>
              <span>🟢</span>
              <span>server 1</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 2</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 3</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 4</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 5</span>
            </div>
          </div>
          <div>
            <div>
              <span>🟢</span>
              <span>server 6</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 7</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 8</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 9</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 10</span>
            </div>
          </div>
          <div>
            <div>
              <span>🟢</span>
              <span>server 11</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 12</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 13</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 14</span>
            </div>
            <div>
              <span>🟢</span>
              <span>server 15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stats() {
  return (
    <>
      <div className={styles.item}>
        <div className={styles.content}>Idled hours: 45k</div>
      </div>
    </>
  );
}

export default Home;
