import { useContext, useEffect } from "react";
import { Row, Button } from "react-bootstrap";
import { removeLocalStorage, setLocalStorage } from "../../../commons";
import { AuthTypeContext } from "../../../pages/dashboard/addaccount";
import { WebSocketContext } from "../../WebSocketProvider";

type Props = {
  accountName?: string;
  countdown?: number;
};

export default function CancelButton(props: Props) {
  const ws = useContext(WebSocketContext);
  const authTypeContext = useContext(AuthTypeContext);

  async function cancel() {
    // setLoading(true);
    ws?.send({ type: "steamaccount/cancelConfirmation", body: { accountName: props.accountName } });
  }

  useEffect(() => {
    if (!ws) return;

    ws.on("steamaccount/cancelConfirmation", () => {
      removeLocalStorage("QRcode");
      removeLocalStorage("SteamGuardCode");
      if (props.countdown) {
        // add extra seconds to coutdown to account for network and processing
        setLocalStorage("ignoreLogonWasNotConfirmed", {}, props.countdown + 30);
      }
      authTypeContext.setAuthType("");
    });

    return () => {
      ws.removeAllListeners("steamaccount/cancelConfirmation");
    };
  }, [ws]);

  return (
    <Row className={`mb-3 justify-content-center`} lg={2}>
      <Button variant="secondary" onClick={cancel} size="lg">
        Cancel
      </Button>
    </Row>
  );
}
