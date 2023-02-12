import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useContext, useEffect } from "react";
import { Row, Button } from "react-bootstrap";
import { WebSocketContext } from "../../WebSocketProvider";
import ErrorHandler from "./ErrorHandler";
import { WaitingOnSteam } from "./WaitingOnSteam";

type ChildProps = {
  setAuthType: React.Dispatch<React.SetStateAction<"" | "QRcode" | "SteamGuardCode">>;
};

export default function QRCode(props: ChildProps) {
  const [qrCode, setQrCode] = useState("");
  const ws = useContext(WebSocketContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const router = useRouter();

  function reset() {
    setError("");
    setQrCode("");
    setLoading(false);
    setCountdown(0);
    clearInterval(intervalId);
  }

  function sendAdd() {
    reset();
    setLoading(true);
    ws?.send({
      type: "steamaccount/add",
      body: {
        authType: "QRcode",
      },
    });
  }

  function setCountDownInterval(initial: number) {
    let counter = initial - 1;
    const timeout = setInterval(() => {
      if (counter) setCountdown(counter--);
    }, 1000);
    setIntervalId(timeout);
  }

  useEffect(() => {
    if (!ws) return;

    sendAdd();

    ws.on("steamaccount/add", (data) => {
      if (data.success) {
        router.push("/dashboard");
      } else {
      }
    });

    ws.on("steamaccount/waitingForConfirmation", (data) => {
      if (data.message.timeoutSeconds) {
        setLoading(false);
        setCountDownInterval(data.message.timeoutSeconds);
      }
      setQrCode(data.message.qrCode);
    });

    ws.on("steamaccount/confirmedByUser", (data) => {
      clearInterval(intervalId);
      setLoading(true);
    });

    ws.on("error", (error) => {
      reset();
      setError(error.message);
    });

    return () => {
      if (ws) {
        console.log("CLEARED LISTENERS");
        ws.removeAllListeners("steamaccount/waitingForConfirmation");
        ws.removeAllListeners("error");
        ws.removeAllListeners("steamaccount/add");
      }
    };
  }, []);

  if (error) {
    return <ErrorHandler error={error} retryFunc={sendAdd} setAuthType={props.setAuthType} />;
  }

  if (loading) {
    return <WaitingOnSteam />;
  }

  return (
    <>
      <Row className={`mb-3 text-center`}>
        <h6>Scan code with the Steam App</h6>
      </Row>

      <Row className={`mb-3 justify-content-center`} lg={2}>
        <h6 className={`text-center`}>Timeout: {countdown} seconds</h6>
      </Row>

      <Row className={`mb-3 justify-content-center text-center`} lg={2}>
        <div>
          <Image src={qrCode} height={350} width={350} alt={"qr code"} />
        </div>
      </Row>

      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Button variant="secondary" onClick={() => props.setAuthType("")} size="lg">
          Cancel
        </Button>
      </Row>
    </>
  );
}
