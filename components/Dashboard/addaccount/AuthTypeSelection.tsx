import { Row, Button } from "react-bootstrap";

type ChildProps = {
  setAuthType: React.Dispatch<React.SetStateAction<"" | "QRcode" | "SteamGuardCode">>;
};

export default function AuthTypeSelection(props: ChildProps) {
  return (
    <>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => props.setAuthType("QRcode")} size="lg">
          QR Code
        </Button>
      </Row>

      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={() => props.setAuthType("SteamGuardCode")} size="lg">
          Steam Guard Code
        </Button>
      </Row>
    </>
  );
}
