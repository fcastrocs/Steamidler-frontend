import { Alert } from "react-bootstrap";

export default function AlertMessage(props: { message: string; variant: string }) {
  return (
    <Alert key={props.variant} variant={props.variant} className={`text-center`}>
      {props.message}
    </Alert>
  );
}
