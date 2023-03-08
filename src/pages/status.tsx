import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { request } from "../commons";
import styles from "../styles/Status.module.css";

const Status: NextPage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    request("GET", "proxystatus/get").then((res) => {
      console.log(res);
      setResults(res);
    });
  }, []);

  return (
    <Container className={styles.container}>
      <Row className="mb-3">
        <h1 className="text-center">Server Status Page</h1>
        <h5 className="text-center">Updates every 5 minutes</h5>
      </Row>
      {results.map((server: any, index) => {
        return (
          <Row key={server._id} md={1} className={`my-2 justify-content-center ${styles.box}`}>
            <Row>
              <h3 className="text-center">{`Server ${index + 1}`}</h3>
            </Row>
            <Row className="mx-3 my-2 justify-content-center text-center">
              <h5>Alive</h5>
              <Row md={20} className={"m-1 justify-content-center"}>
                {server.results[0].aliveStatus.map((res: any, index: number) => {
                  return (
                    <Col
                      key={server._id + "a"}
                      className={`${styles[res]} mx-2 ${index === server.results[0].index - 1 ? styles.index : ""}`}
                    ></Col>
                  );
                })}
              </Row>
            </Row>
            <Row className="mx-3 my-2 justify-content-center">
              <h5 className="text-center">Connectivity to Steam</h5>
              <Row md={20} className={"m-1 justify-content-center"}>
                {server.results[0].steamConnectStatus.map((res: any) => {
                  return (
                    <Col
                      key={server._id + "b"}
                      className={`${styles[res]} mx-2  ${index === server.results[0].index - 1 ? styles.index : ""}`}
                    ></Col>
                  );
                })}
              </Row>
            </Row>
          </Row>
        );
      })}
    </Container>
  );
};

export default Status;
