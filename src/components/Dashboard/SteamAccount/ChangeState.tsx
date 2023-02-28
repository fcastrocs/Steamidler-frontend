import { SteamAccount } from "@machiavelli/steam-client";
import { useContext, useEffect, useState } from "react";
import { Button, Container, Dropdown, Form, Modal, Row } from "react-bootstrap";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import CustomSpinner from "../../Spinner";

export default function ChangeState(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [state, setState] = useState("");
  const addToast = useContext(ToastContext);

  const changeState = () => {
    setLoading(true);
    ws?.send({ type: "steamclient/changepersonastate", body: { accountName: props.s.accountName, state } });
  };

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
  };

  const reset = () => {
    setState("");
    setLoading(false);
  };

  const handleClose = () => {
    ws?.removeListener("error", reset);
    ws?.removeAllListeners("steamclient/changepersonastate");
    setShow(false);
  };

  useEffect(() => {
    if (!ws) return;

    ws.on("steamclient/changepersonastate", () => {
      addToast(`Success, friends state set to ${state}.`);
      reset();
    });

    ws.on("error", reset);

    return () => {
      ws.removeListener("error", reset);
      ws.removeAllListeners("steamclient/changepersonastate");
    };
  }, [ws, state]);

  return (
    <>
      <Dropdown.Item onClick={() => setShow(true)}>Change State</Dropdown.Item>

      <Modal show={show} backdrop="static" keyboard={false} data-backdrop="static">
        <Modal.Header>
          <Modal.Title>Change Friends State</Modal.Title>
        </Modal.Header>
        <Container>
          {loading && (
            <Row className="d-flex justify-content-center mb-3">
              <CustomSpinner />
            </Row>
          )}
          {!loading && (
            <>
              <Modal.Body>
                <Form.Select onChange={onChange}>
                  <option value="">Select state</option>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Away">Away</option>
                  <option value="Invisible">Invisible</option>
                </Form.Select>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={changeState} disabled={!state}>
                  Change State
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </>
          )}
        </Container>
      </Modal>
    </>
  );
}
