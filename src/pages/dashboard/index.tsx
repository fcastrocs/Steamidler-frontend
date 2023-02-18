import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Dropdown, DropdownButton, Row, Spinner } from "react-bootstrap";
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
  const ws = useContext(WebSocketContext);

  function login(accountName: string) {
    ws?.send({ type: "steamaccount/login", body: { accountName } });
  }

  return (
    <Container fluid="md" className={`px-4`}>
      <Row md={2}>
        {props.steamAccounts.map((s) => {
          return (
            <Col className="d-flex justify-content-center" key={s._id}>
              <Card style={{ width: "250px" }}>
                <Card.Img variant="top" src={s.data.state.avatarString} width={250} height={250} />
                <Card.Body>
                  <Card.Title className={`text-center`}>{s.data.state.playerName}</Card.Title>
                  <Row>{s.accountName}</Row>
                  <Row>Status: {s.state.status}</Row>
                  <Row>Farming: {s.data.farming ? "on" : "off"}</Row>
                  <Row>Idling: {s.data.gamesIdsIdle ? "on" : "off"}</Row>
                  <Row md={3} className={`mb-2`}>
                    <Col className="d-flex justify-content-center">
                      <Button variant="outline-primary">Idle</Button>
                    </Col>
                    <Col className="d-flex justify-content-center">
                      <Button variant="outline-primary">Farm</Button>
                    </Col>
                    <Col className="d-flex justify-content-center">
                      <Button variant="outline-primary">Trade</Button>
                    </Col>
                  </Row>
                  <Row className="text-center">
                    <DropdownButton id="dropdown-basic-button" title="Actions" variant="outline-primary">
                      <Dropdown.Item
                        onClick={() => {
                          login(s.accountName);
                        }}
                      >
                        Login
                      </Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Logout</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Authenticate</Dropdown.Item>
                      <Dropdown.Item href="#/action-3">Delete</Dropdown.Item>
                    </DropdownButton>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default Dashboard;
