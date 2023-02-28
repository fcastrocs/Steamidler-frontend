import { SteamAccount } from "@machiavelli/steam-client";
import { useContext, useEffect, useState } from "react";
import { Button, Container, Dropdown, Form, Modal, Row } from "react-bootstrap";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import CustomSpinner from "../../Spinner";

export default function ChangePrivacy(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [privacy, setPrivacy] = useState("");
  const addToast = useContext(ToastContext);

  const changePrivacy = () => {
    setLoading(true);
    ws?.send({ type: "steamweb/changeprivacy", body: { accountName: props.s.accountName, privacy } });
  };

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrivacy(e.target.value);
  };

  const reset = () => {
    setPrivacy("");
    setLoading(false);
  };

  const handleClose = () => {
    ws?.removeListener("error", reset);
    ws?.removeAllListeners("steamweb/changeprivacy");
    setShow(false);
  };

  useEffect(() => {
    if (!ws) return;

    ws.on("steamweb/changeprivacy", () => {
      addToast(`Success, privacy set to ${privacy}.`);
      reset();
    });

    ws.on("error", reset);

    return () => {
      ws.removeListener("error", reset);
      ws.removeAllListeners("steamweb/changeprivacy");
    };
  }, [ws, privacy]);

  return (
    <>
      <Dropdown.Item onClick={() => setShow(true)}>Change Privacy</Dropdown.Item>

      <Modal show={show} backdrop="static" keyboard={false} data-backdrop="static">
        <Modal.Header>
          <Modal.Title>Change Profile Privacy</Modal.Title>
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
                  <option value="">Select privacy setting</option>
                  <option value="public">Public</option>
                  <option value="friendsOnly">Friends Only</option>
                  <option value="private">Private</option>
                </Form.Select>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={changePrivacy} disabled={!privacy}>
                  Change Privacy
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
