import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { WebSocketContext } from "../../components/WebSocketProvider";

const Dashboard: NextPage = () => {
  const firstUpdate = useRef(true);
  const [steamAccounts, setSteamAccounts] = useState<any>([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const router = useRouter();
  const ws = useContext(WebSocketContext);

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/getall" });

    // get all accounts
    const interval = setInterval(() => {
      ws.send({ type: "steamaccount/getall" });
    }, 5000);

    // get all steam account
    ws.on("steamaccount/getall", (data) => {
      setSteamAccounts(data.message);
      setAccountsLoaded(true);
    });

    // state changed on a steam account
    ws.on("PersonaStateChanged", (data) => {
      console.log(data);
    });

    return () => clearInterval(interval);
  }, [ws]);

  if (!accountsLoaded && firstUpdate.current) {
    return <Spinner animation="border" />;
  }

  if (!steamAccounts.length) {
    router.push("/dashboard/addaccount");
  }

  return <RenderAccounts steamAccounts={steamAccounts} />;
};

function RenderAccounts(props: { steamAccounts: any[] }) {
  return (
    <Container fluid="md" className={`px-4 text-center`}>
      <Row className={`mb-3`}>
        <Col></Col>
        <Col>Player name</Col>
        <Col>Status</Col>
        <Col>Farming</Col>
        <Col>Idling</Col>
      </Row>
      {props.steamAccounts.map((s) => {
        return (
          <Row key={s._id} className={`mb-1`}>
            <Col>
              <Image src={s.data.state.avatarString} alt="steam-avatar" width={80} height={80}></Image>
            </Col>
            <Col>
              <Row>{s.data.state.playerName}</Row>
              <Row>steam id</Row>
            </Col>
            <Col>{s.state.status}</Col>
            <Col>Farming: {s.state.farming ? "On" : "Off"}</Col>
            <Col>{s.state.gamesIdsIdle.length ? "On" : "Off"}</Col>
          </Row>
        );
      })}
    </Container>
  );
}

export default Dashboard;
