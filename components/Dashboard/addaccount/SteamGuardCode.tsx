import { useRouter } from "next/router";
import { useState, useContext, useEffect, Dispatch, SetStateAction } from "react";
import { Row, Form, InputGroup, Button } from "react-bootstrap";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import AlertMessage from "../../Alert";
import { WebSocketContext } from "../../WebSocketProvider";
import ErrorHandler from "./ErrorHandler";
import { WaitingOnSteam } from "./WaitingOnSteam";

type ChildProps = {
  setAuthType: React.Dispatch<React.SetStateAction<"" | "QRcode" | "SteamGuardCode">>;
};

function SubmitSteamGuardCodeForm(props: { setLoading: Dispatch<SetStateAction<boolean>>; guardType: string }) {
  const [guardCode, setGuardCode] = useState("");
  const ws = useContext(WebSocketContext);

  const submitGuardCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardCode) {
      return;
    }

    props.setLoading(true);

    ws?.send({
      type: "steamaccount/updateWithSteamGuardCode",
      body: {
        code: guardCode,
        guardType: props.guardType,
      },
    });
  };

  return (
    <>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Form onSubmit={submitGuardCode} className={`p-0`}>
          <InputGroup className="mb-4" size="lg">
            <InputGroup.Text id="guardCode-addon">
              <MdOutlineMail />
            </InputGroup.Text>
            <Form.Control
              required
              type="text"
              placeholder="Steam guard code"
              onChange={(e) => setGuardCode(e.target.value)}
              aria-describedby="guardCode-addon"
            />
          </InputGroup>

          <div className={`d-grid gap-2`}>
            <Button variant="primary" type="submit" size="lg">
              Submit
            </Button>
          </div>
        </Form>
      </Row>
    </>
  );
}

function AddAccountForm(props: { reset: () => void; setLoading: Dispatch<SetStateAction<boolean>> }) {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const ws = useContext(WebSocketContext);

  function sendAdd() {
    props.reset();
    props.setLoading(true);

    ws?.send({
      type: "steamaccount/add",
      body: {
        authType: "SteamGuardCode",
        accountName,
        password,
      },
    });
  }

  const formSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !accountName) {
      return;
    }

    sendAdd();
  };

  return (
    <>
      <Row className={`mb-3 text-center`}>
        <h6>You can revoke access from within the Steam app</h6>
        <h6>We do not save your password</h6>
      </Row>
      <Row className={`mb-3 justify-content-center`} lg={2}>
        <Form onSubmit={formSubmit} className={`p-0`}>
          <InputGroup className="mb-4" size="lg">
            <InputGroup.Text id="accountName-addon">
              <MdOutlineMail />
            </InputGroup.Text>
            <Form.Control
              required
              type="text"
              placeholder="Account Name"
              onChange={(e) => setAccountName(e.target.value)}
              aria-describedby="accountName-addon"
            />
          </InputGroup>

          <InputGroup className="mb-4" size="lg">
            <InputGroup.Text id="password-addon">
              <MdPassword />
            </InputGroup.Text>
            <Form.Control
              required
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="password-addon"
            />
          </InputGroup>

          <div className={`d-grid gap-2`}>
            <Button variant="primary" type="submit" size="lg">
              Login
            </Button>
          </div>
        </Form>
      </Row>
    </>
  );
}

export default function SteamGuardCode(props: ChildProps) {
  const ws = useContext(WebSocketContext);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [guardType, setGuardType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const router = useRouter();

  function reset() {
    setError("");
    setLoading(false);
    setAlert("");
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
        if (!loading) setLoading(true);
      }
    });

    ws.on("steamaccount/waitingForConfirmation", (data) => {
      setLoading(false);

      if (data.message.guardType) {
        setGuardType(data.message.guardType);
      }

      if (data.message.timeoutSeconds) {
        setCountDownInterval(data.message.timeoutSeconds);
      }

      if (data.message.guardType === "deviceConfirmation") {
        setAlert("Steam sent confirmation to your Steam app.");
      } else if (data.message.guardType.toLowerCase().includes("code")) {
        setShowCodeInput(true);
      }
    });

    ws.on("steamaccount/confirmedByUser", (data) => {
      setShowCodeInput(false);
      clearInterval(intervalId);
    });

    ws.on("error", (error) => {
      setError(error.message);
    });

    return () => {
      if (ws) {
        console.log("CLEARED LISTENERED");
        ws.removeAllListeners("steamaccount/waitingForConfirmation");
        ws.removeAllListeners("error");
        ws.removeAllListeners("steamaccount/add");
      }
    };
  }, []);

  if (error) {
    return <ErrorHandler error={error} retryFunc={reset} setAuthType={props.setAuthType} />;
  }

  if (loading) {
    return <WaitingOnSteam />;
  }

  return (
    <>
      {intervalId && (
        <Row className={`mb-3 text-center`}>
          <h6>Timeout: {countdown} seconds</h6>
        </Row>
      )}

      {alert && (
        <Row className={`mb-3 justify-content-center`} lg={2}>
          <AlertMessage message={alert} variant={"warning"} />
        </Row>
      )}

      {!alert && (
        <>
          {showCodeInput && <SubmitSteamGuardCodeForm setLoading={setLoading} guardType={guardType} />}
          {!showCodeInput && <AddAccountForm reset={reset} setLoading={setLoading} />}

          <Row className={`mb-3 justify-content-center`} lg={2}>
            <Button variant="secondary" onClick={() => props.setAuthType("")} size="lg">
              Cancel
            </Button>
          </Row>
        </>
      )}
    </>
  );
}
