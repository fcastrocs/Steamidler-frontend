/**
 * Cancel steam confirmation
 */

import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { Row, Button } from "react-bootstrap";
import { removeLocalStorage, setLocalStorage } from "../../../commons";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

type Props = {
  accountName?: string;
  countdown?: number;
};

export default function CancelConfirmation(props: Props) {
  const ws = useContext(WebSocketContext);
  const router = useRouter();

  async function cancel() {
    ws?.send({ type: "steamaccount/cancelconfirmation", body: { accountName: props.accountName } });
  }

  useEffect(() => {
    if (!ws) return;

    ws.on("steamaccount/cancelconfirmation", () => {
      removeLocalStorage("QRcode");
      removeLocalStorage("SteamGuardCode");
      if (props.countdown) {
        // add extra seconds to coutdown to account for network and processing
        setLocalStorage("ignoreLogonWasNotConfirmed", {}, props.countdown + 30);
      }
      router.push("/dashboard/addaccount");
    });

    return () => {
      ws.removeAllListeners("steamaccount/cancelconfirmation");
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
