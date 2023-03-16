import { SteamAccount } from "@fcastrocs/steamclient";
import { useContext, useEffect, useState } from "react";
import { Button, Container, Dropdown, Form, Modal, Row } from "react-bootstrap";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import CustomSpinner from "../../Spinner";

export default function ReedemCDKEY(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [cdkey, setCdkey] = useState("");
  const addToast = useContext(ToastContext);

  const activate = () => {
    setLoading(true);
    ws?.send({ type: "steamclient/cdkeyredeem", body: { accountName: props.s.accountName, cdkey } });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setCdkey(e.target.value);
  };

  const reset = () => {
    setCdkey("");
    setLoading(false);
  };

  const handleClose = () => {
    ws?.removeListener("error", reset);
    ws?.removeAllListeners("steamclient/cdkeyredeem");
    setShow(false);
  };

  useEffect(() => {
    if (!ws) return;

    ws.on("steamclient/cdkeyredeem", (data) => {
      const games = data.message.games as SteamAccount["data"]["games"];
      addToast(`Success. ${games.length} game(s) redeemed.`);
      reset();
    });

    ws.on("error", reset);

    return () => {
      ws.removeListener("error", reset);
      ws.removeAllListeners("steamclient/cdkeyredeem");
    };
  }, [ws]);

  return (
    <>
      <Dropdown.Item onClick={() => setShow(true)}>Redeem CDKEY</Dropdown.Item>

      <Modal show={show} backdrop="static" keyboard={false} data-backdrop="static">
        <Modal.Header>
          <Modal.Title>Redeem CDKEY</Modal.Title>
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
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>App Id</Form.Label>
                    <Form.Control type="text" placeholder="example type 730 for csgo" onChange={onChange} />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={activate} disabled={!cdkey}>
                  Activate
                </Button>
              </Modal.Footer>
            </>
          )}
        </Container>
      </Modal>
    </>
  );
}
