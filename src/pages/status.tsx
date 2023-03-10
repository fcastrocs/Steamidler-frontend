import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { request } from "../commons";
import styles from "../styles/Status.module.css";

const Status: NextPage = () => {
  const [results, setResults] = useState([]);
  const [uptimes, setUptimes] = useState<{ aliveUptime: string; steamUptime: string }[]>([]);

  useEffect(() => {
    request("GET", "proxystatus/get").then((res) => {
      const tempUptimes = [];
      console.log(res);

      // calculate uptimes
      for (const server of res) {
        const aliveUptime =
          (server.results[0].aliveStatus.reduce((partialSum: number, result: any) => {
            return (result === "OK" ? 1 : 0) + partialSum;
          }, 0) /
            100) *
          100;

        const steamUptime =
          (server.results[0].steamConnectStatus.reduce((partialSum: number, result: any) => {
            return (result === "OK" ? 1 : 0) + partialSum;
          }, 0) /
            100) *
          100;

        tempUptimes.push({ aliveUptime: aliveUptime.toFixed(2), steamUptime: steamUptime.toFixed(2) });
      }

      setUptimes(tempUptimes);
      setResults(res);
    });
  }, []);

  return (
    <Container className={`${styles.container}`}>
      <Row className="mb-3">
        <h1 className="text-center">Server Status Page</h1>
        <h5 className="text-center">Updates every 10 minutes</h5>
      </Row>
      {results.map((server: any, index) => {
        return (
          <Row key={server._id} md={1} className={`my-2 justify-content-center ${styles.box}`}>
            <Row className={styles.tab}>
              <h3 className="">{server.name}</h3>
            </Row>
            <Row className="justify-content-center">
              <Row>
                <Col>
                  <h5 className="m-1">Alive</h5>
                </Col>
                <Col className={`d-flex align-items-center justify-content-end`}>
                  <h6 className={styles.uptime}>{uptimes[index].aliveUptime + "% uptime"}</h6>
                </Col>
              </Row>
              <Row className={"m-1 justify-content-center"}>
                {server.results[0].aliveStatus.map((res: any, index: number) => {
                  return (
                    <Col
                      key={"alive" + index}
                      className={`${styles.status} ${styles[res == "OK" ? "OK" : "BAD"]} ${
                        index === server.results[0].index - 1 ? styles.index : ""
                      }`}
                    ></Col>
                  );
                })}
              </Row>
            </Row>
            <Row className="justify-content-center">
              <Row>
                <Col>
                  <h5 className="m-1">Steam Connectivity</h5>
                </Col>
                <Col className="d-flex align-items-center justify-content-end">
                  <h6 className={styles.uptime}>{uptimes[index].steamUptime + "% uptime"}</h6>
                </Col>
              </Row>
              <Row xs={5} className={"m-1 justify-content-center"}>
                {server.results[0].steamConnectStatus.map((res: any, index: number) => {
                  return (
                    <Col
                      key={"steam" + index}
                      className={`${styles.status} ${styles[res == "OK" ? "OK" : "BAD"]} ${
                        index === server.results[0].index - 1 ? styles.index : ""
                      }`}
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
