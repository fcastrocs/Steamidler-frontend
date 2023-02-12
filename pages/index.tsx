import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";

const Home: NextPage = () => {
  return (
    <Container fluid>
      <div className={styles.home}>
        <Features />
      </div>
    </Container>
  );
};

function Features() {
  return (
    <Row>
      {/* Features header */}
      <Row className="justify-content-around">
        <Col xs={6} className="text-center">
        <h1 className="text-center">Why steamidler is so great?</h1>
        <div className="text-center my-3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </div>
          </Col>
        </Row>


        {/* Main features row */}
        <Row className="justify-content-around my-5">
        <Col xs={3} className={`${styles.features} text-center`}>
          <h2>🎮</h2>
          <div>Idle up to 32 games from your library at a time.</div>
          <div>Farm all your trading cards with a single click.</div>
        </Col>

        <Col xs={3} className={`${styles.features} text-center`}>
          <h2>⚙️</h2>
            <div>Change avatar, persona, privacy, nickname.</div>
            <div>Redeem cd-keys.</div>
            <div>Add any free to play game.</div>
            <div>Clear previous aliases.</div>
            <div>Send trade offers.</div>
        </Col>

        <Col xs={3} className={`${styles.features} text-center`}>
          <h2>🌐</h2>
            <div>No Vac bans because Valve acknowledges idling. </div>
            <div>Support for 2FA and email Steam Guard.</div>
            <div>Auto-restard account on disconnect.</div>
        </Col>
        </Row>
    

      {/* Stats row */}
      <Row className={`text-center mt-5`}>
        <h1>📊</h1>
        <div>Stats</div>
        <div>Idled hours: 10,000</div>
      </Row>
    </Row>
  );
}

export default Home;
