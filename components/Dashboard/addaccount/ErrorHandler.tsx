import { Button, Row } from "react-bootstrap";
import AlertMessage from "../../Alert";

type Props = {
  error: string;
  retryFunc: () => void;
  setAuthType: React.Dispatch<React.SetStateAction<"" | "QRcode" | "SteamGuardCode">>;
};

export default function ErrorHandler(props: Props) {
  return (
    <>
      <Row className={`mb-3 justify-content-center`}>
        <AlertMessage message={props.error} variant={"danger"} />
      </Row>

      <Row className={`mb-3 justify-content-center`}>
        <Button variant="primary" onClick={props.retryFunc} type="submit" size="lg">
          Retry
        </Button>
      </Row>

      <Row className={`mb-3 justify-content-center`}>
        <Button variant="secondary" onClick={() => props.setAuthType("")} size="lg">
          Cancel
        </Button>
      </Row>
    </>
  );
}
