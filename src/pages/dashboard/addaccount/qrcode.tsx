import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useContext, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../../../commons";
import CancelConfirmation from "../../../components/Dashboard/AddSteamAccount/CancelConfimation";
import ErrorHandler from "../../../components/Dashboard/AddSteamAccount/ErrorHandler";
import { WaitingOnSteam } from "../../../components/Dashboard/AddSteamAccount/WaitingOnSteam";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function QRCode() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const ws = useContext(WebSocketContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

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
        accountName: "",
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

    ws.on("steamaccount/add", (data) => {
      if (data.success) {
        router.push("/dashboard");
      } else {
      }
    });

    ws.on("steamaccount/waitingforconfirmation", (data) => {
      if (data.message.timeoutSeconds) {
        setLoading(false);
        setCountDownInterval(data.message.timeoutSeconds);

        // save session
        setLocalStorage(
          "QRcode",
          {
            qrCode: data.message.qrCode,
          },
          data.message.timeoutSeconds
        );
      }
      setQrCode(data.message.qrCode);
    });

    ws.on("steamaccount/confirmed", () => {
      setLoading(true);
      router.push("/dashboard");
      removeLocalStorage("QRcode");
    });

    ws.on("error", (error) => {
      if (getLocalStorage("ignoreLogonWasNotConfirmed") && error.message === "LogonWasNotConfirmed") {
        return removeLocalStorage("ignoreLogonWasNotConfirmed");
      }
      reset();
      setError(error.message);
    });

    const session = getLocalStorage("QRcode");
    if (!session) {
      sendAdd();
    } else {
      setCountDownInterval(session.remaining);
      setQrCode(session.qrCode);
      setLoading(false);
    }

    return () => {
      if (ws) {
        ws.removeAllListeners("steamaccount/add");
        ws.removeAllListeners("steamaccount/waitingforconfirmation");
        ws.removeAllListeners("steamaccount/confirmed");
        ws.removeAllListeners("steamaccount/cancelconfirmation");
        ws.removeAllListeners("error");
      }
    };
  }, [ws]);

  if (error) {
    return <ErrorHandler error={error} retryFunc={sendAdd} />;
  }

  if (loading) {
    return <WaitingOnSteam />;
  }

  return (
    <Container>
      <Row className={`mb-3 text-center`}>
        <h1>Scan code with the Steam App</h1>
        <h5 className={`text-center`}>Timeout: {countdown} seconds</h5>
      </Row>

      <Row className={`mb-3 justify-content-center text-center`} lg={2}>
        <div>
          <Image src={qrCode} height={350} width={350} alt={"qr code"} />
        </div>
      </Row>

      <CancelConfirmation accountName="" countdown={countdown} />
    </Container>
  );
}
