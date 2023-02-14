import { Row } from "react-bootstrap";
import CustomSpinner from "../../Spinner";

export function WaitingOnSteam() {
  return (
    <>
      <Row className={`mb-3 text-center`}>
        <h6>Waiting on Steam</h6>
      </Row>
      <Row className={`mb-3 justify-content-center`}>
        <CustomSpinner />
      </Row>
    </>
  );
}
