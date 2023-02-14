import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import { Row } from "react-bootstrap";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../../../commons";
import { AddSteamContext } from "../../../pages/dashboard/addaccount";
import { WebSocketContext } from "../../WebSocketProvider";
import CancelButton from "./CancelButton";
import ErrorHandler from "./ErrorHandler";
import { WaitingOnSteam } from "./WaitingOnSteam";

export default function QRCode() {
  const [qrCode, setQrCode] = useState("");
  const ws = useContext(WebSocketContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const addSteamContext = useContext(AddSteamContext);

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
        addSteamContext.setSuccess("Account added successfully.");
        addSteamContext.setAuthType("");
      } else {
      }
    });

    ws.on("steamaccount/waitingForConfirmation", (data) => {
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

    ws.on("steamaccount/confirmedByUser", () => {
      setLoading(true);
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
        ws.removeAllListeners("steamaccount/waitingForConfirmation");
        ws.removeAllListeners("steamaccount/confirmedByUser");
        ws.removeAllListeners("steamaccount/cancelConfirmation");
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

      <CancelButton accountName="" countdown={countdown} />
    </>
  );
}
