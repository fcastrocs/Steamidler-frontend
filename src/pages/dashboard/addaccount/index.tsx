import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Button, Container, Row } from "react-bootstrap";
import { getLocalStorage } from "../../../commons";

const AddSteamAccount: NextPage = () => {
  const router = useRouter();

  // load up previous session
  useEffect(() => {
    if (getLocalStorage("QRcode")) {
      router.push("/dashboard/addaccount/qrcode");
    } else if (getLocalStorage("SteamGuardCode")) {
      router.push("/dashboard/addaccount/steamguardcode");
    }
  }, []);

  return (
    <Container fluid="md" className="px-4">
      <Row className={`mb-3 text-center`}>
        <h2>Add Steam Account</h2>
      </Row>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => router.push("/dashboard/addaccount/qrcode")} size="lg">
          QR Code
        </Button>
      </Row>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => router.push("/dashboard/addaccount/steamguardcode")} size="lg">
          Steam Guard Code
        </Button>
      </Row>
    </Container>
  );
};

export default AddSteamAccount;
