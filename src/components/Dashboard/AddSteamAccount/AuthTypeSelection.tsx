import { Row, Button } from "react-bootstrap";
import { useContext } from "react";
import { AddSteamContext } from "../../../pages/dashboard/addaccount";

export default function AuthTypeSelection() {
  const addSteamContext = useContext(AddSteamContext);

  return (
    <>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => addSteamContext.setAuthType("QRcode")} size="lg">
          QR Code
        </Button>
      </Row>

      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => addSteamContext.setAuthType("SteamGuardCode")} size="lg">
          Steam Guard Code
        </Button>
      </Row>
    </>
  );
}
