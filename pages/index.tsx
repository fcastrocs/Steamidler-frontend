import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";

const Home: NextPage = () => {
  return (
    <Container fluid>
      <div className={styles.home}>
        <Features />
        <ServerStatus />
        <Stats />
      </div>
    </Container>
  );
};

function Features() {
  return (
    <Row className={styles.section}>
      <Row className={styles.sectionName}>Features</Row>
      <Row className={styles.sectionBody}>
        <Col>
          <Row>
            <span>🎮</span>
            <span>Idle up to 32 games from your library at a time.</span>
          </Row>
          <Row>
            <span>⚙️</span>
            <span>
              <div>Change avatar, persona, privacy, nickname.</div>
              <div>Redeem cd-keys.</div>
              <div>Add any free to play game.</div>
              <div>Clear previous aliases.</div>
              <div>Send trade offers.</div>
            </span>
          </Row>
        </Col>
        <Col>
          <Row>
            <span>🧑‍🌾</span>
            <span>Farm all your trading cards with a single click.</span>
          </Row>
          <Row>
            <span>🌐</span>
            <span>
              <div>No Vac bans because Valve acknowledges idling. </div>
              <div>Support for 2FA and email Steam Guard.</div>
              <div>Auto-restard account on disconnect.</div>
            </span>
          </Row>
        </Col>
      </Row>
    </Row>
  );
}

function ServerStatus() {
  return (
    <Row className={styles.section}>
      <Row className={styles.sectionName}>Server Status</Row>
      <Row className={styles.sectionBody}>
        <Row>Updates every 5 mins</Row>
        <Row>
          <span>📊</span>
          .....
        </Row>
      </Row>
    </Row>
  );
}

function Stats() {
  return (
    <Row className={styles.section}>
      <Row className={styles.sectionName}>Stats</Row>
      <Row className={styles.sectionBody}>
        <Row>Idled hours: 10,000</Row>
      </Row>
    </Row>
  );
}

export default Home;
