import { SteamAccount } from "@fcastrocs/steamclient";
import { useContext, useEffect, useState } from "react";
import { Button, Container, Dropdown, Form, Modal, Row } from "react-bootstrap";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import CustomSpinner from "../../Spinner";

export default function Activatef2pGame(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [appids, setAppids] = useState<number[]>([]);
  const addToast = useContext(ToastContext);

  const activate = () => {
    setLoading(true);
    ws?.send({ type: "steamclient/activatef2pgame", body: { accountName: props.s.accountName, appids } });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      return setAppids([]);
    }

    const ids = e.target.value
      .split(",")
      .filter((x) => {
        x = x.trim();
        if (!x.length) return false;
        const number = Number(x);
        console.log(number);
        if (isNaN(number)) return false;
        return true;
      })
      .map(Number);

    setAppids(ids);
  };

  const reset = () => {
    setAppids([]);
    setLoading(false);
  };

  const handleClose = () => {
    ws?.removeListener("error", reset);
    ws?.removeAllListeners("steamclient/activatef2pgame");
    setShow(false);
  };

  useEffect(() => {
    if (!ws) return;

    ws.on("steamclient/activatef2pgame", (data) => {
      const games = data.message.games as SteamAccount["data"]["games"];
      addToast(`Success. ${games.length} game(s) activated.`);
      reset();
    });

    ws.on("error", reset);

    return () => {
      ws.removeListener("error", reset);
      ws.removeAllListeners("steamclient/activatef2pgame");
    };
  }, [ws]);

  return (
    <>
      <Dropdown.Item onClick={() => setShow(true)}>Activate F2P Game</Dropdown.Item>

      <Modal show={show} backdrop="static" keyboard={false} data-backdrop="static">
        <Modal.Header>
          <Modal.Title>Activate Free to play Game</Modal.Title>
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
                <Button variant="primary" onClick={activate} disabled={!appids.length}>
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
