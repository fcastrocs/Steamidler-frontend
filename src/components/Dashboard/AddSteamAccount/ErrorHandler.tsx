import { Button, Row } from "react-bootstrap";
import AlertMessage from "../../Alert";
import CancelButton from "./CancelConfimation";

type Props = {
  error: string;
  retryFunc: () => void;
  accountName?: string;
};

export default function ErrorHandler(props: Props) {
  return (
    <>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <AlertMessage message={props.error} variant={"danger"} />
      </Row>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="primary" onClick={props.retryFunc} type="submit" size="lg">
          Retry
        </Button>
      </Row>

      <CancelButton accountName={props.accountName}></CancelButton>
    </>
  );
}
