import { CSSProperties } from "react";
import { Row, Spinner } from "react-bootstrap";

const style: CSSProperties = {
  width: "1.5rem",
  height: "1.5rem",
  color: "red",
  margin: ".5rem",
  border: "solid 1px darkblue",
};

export default function CustomSpinner() {
  return (
    <Row>
      <Spinner animation="grow" variant="primary" style={style} />
      <Spinner animation="grow" variant="primary" style={style} />
      <Spinner animation="grow" variant="primary" style={style} />
    </Row>
  );
}
