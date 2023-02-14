import type { NextPage } from "next";
import React, { useEffect, useState, createContext } from "react";
import { Container, Row } from "react-bootstrap";
import { getLocalStorage } from "../../commons";
import AlertMessage from "../../components/Alert";
import AuthTypeSelection from "../../components/Dashboard/AddSteamAccount/AuthTypeSelection";
import QRCode from "../../components/Dashboard/AddSteamAccount/QRcode";
import SteamGuardCode from "../../components/Dashboard/AddSteamAccount/SteamGuardCode";

const AddSteamContext = createContext<AuthTypeContextType>({} as AuthTypeContextType);
export { AddSteamContext };

const AddSteamAccount: NextPage = () => {
  const [authType, setAuthType] = useState<AuthTypeValues>("");
  const [success, setSuccess] = useState("");

  // load up previous session
  useEffect(() => {
    if (getLocalStorage("QRcode")) {
      setAuthType("QRcode");
    } else if (getLocalStorage("SteamGuardCode")) {
      setAuthType("SteamGuardCode");
    }
  }, []);

  return (
    <Container fluid="md" className="px-4">
      <Row className={`mb-3 text-center`}>
        <h2>Add Steam Account</h2>
      </Row>
      {success && (
        <Row className={`mb-3 justify-content-center`} lg={2}>
          <AlertMessage message={success} variant={"success"} />
        </Row>
      )}
      <AddSteamContext.Provider value={{ setAuthType, authType, setSuccess }}>
        {!authType && <AuthTypeSelection />}
        {authType === "QRcode" && <QRCode />}
        {authType === "SteamGuardCode" && <SteamGuardCode />}
      </AddSteamContext.Provider>
    </Container>
  );
};

export default AddSteamAccount;
