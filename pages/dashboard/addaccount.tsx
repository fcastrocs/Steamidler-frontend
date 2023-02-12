import type { NextPage } from "next";
import React, { useState } from "react";
import { Container, Row } from "react-bootstrap";
import AuthTypeSelection from "../../components/Dashboard/addaccount/AuthTypeSelection";
import QRCode from "../../components/Dashboard/addaccount/QRcode";
import SteamGuardCode from "../../components/Dashboard/addaccount/SteamGuardCode";

type ChildProps = {
  setAuthType: React.Dispatch<React.SetStateAction<"" | "QRcode" | "SteamGuardCode">>;
};

const AddSteamAccount: NextPage = () => {
  const [authType, setAuthType] = useState<"QRcode" | "SteamGuardCode" | "">("");

  const childprops: ChildProps = {
    setAuthType,
  };

  return (
    <Container fluid="md">
      <Row className={`mb-3 text-center`}>
        <h2>Add Steam Account</h2>
      </Row>
      {!authType && <AuthTypeSelection {...childprops} />}
      {authType === "QRcode" && <QRCode {...childprops} />}
      {authType === "SteamGuardCode" && <SteamGuardCode {...childprops} />}
    </Container>
  );
};

export default AddSteamAccount;
