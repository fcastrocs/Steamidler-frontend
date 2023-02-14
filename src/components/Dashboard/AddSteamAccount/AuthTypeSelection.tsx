import { Row, Button } from "react-bootstrap";
import { useContext } from "react";
import { AuthTypeContext } from "../../../pages/dashboard/addaccount";

export default function AuthTypeSelection() {
  const authTypeContext = useContext(AuthTypeContext);

  return (
    <>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => authTypeContext.setAuthType("QRcode")} size="lg">
          QR Code
        </Button>
      </Row>

      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => authTypeContext.setAuthType("SteamGuardCode")} size="lg">
          Steam Guard Code
        </Button>
      </Row>
    </>
  );
}
