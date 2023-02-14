import type { NextPage } from "next";
import React, { useEffect, useState, createContext } from "react";
import { Container, Row } from "react-bootstrap";
import { getLocalStorage } from "../../commons";
import AuthTypeSelection from "../../components/Dashboard/AddSteamAccount/AuthTypeSelection";
import QRCode from "../../components/Dashboard/AddSteamAccount/QRcode";
import SteamGuardCode from "../../components/Dashboard/AddSteamAccount/SteamGuardCode";

const AuthTypeContext = createContext<AuthTypeContextType>({} as AuthTypeContextType);
export { AuthTypeContext };

const AddSteamAccount: NextPage = () => {
  const [authType, setAuthType] = useState<AuthTypeValues>("");

  // load up previous session
  useEffect(() => {
    if (getLocalStorage("QRcode")) {
      setAuthType("QRcode");
    } else if (getLocalStorage("SteamGuardCode")) {
      setAuthType("SteamGuardCode");
    }
  }, []);

  return (
    <Container fluid="md">
      <Row className={`mb-3 text-center`}>
        <h2>Add Steam Account</h2>
      </Row>
      <AuthTypeContext.Provider value={{ setAuthType, authType }}>
        {!authType && <AuthTypeSelection />}
        {authType === "QRcode" && <QRCode />}
        {authType === "SteamGuardCode" && <SteamGuardCode />}
      </AuthTypeContext.Provider>
    </Container>
  );
};

export default AddSteamAccount;
