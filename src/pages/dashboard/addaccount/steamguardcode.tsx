import { useRouter } from "next/router";
import { useState, useContext, useEffect, SetStateAction, Dispatch } from "react";
import { Row, Form, InputGroup, Button, Container } from "react-bootstrap";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../../../commons";
import AlertMessage from "../../../components/Alert";
import CancelConfirmation from "../../../components/Dashboard/AddSteamAccount/CancelConfimation";
import { WaitingOnSteam } from "../../../components/Dashboard/AddSteamAccount/WaitingOnSteam";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function SteamGuardCode() {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const ws = useContext(WebSocketContext);

  function sendAdd() {
    setError("");
    setLoading(true);

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

  useEffect(() => {
    if (!ws) return;

    ws.on("steamaccount/waitingforconfirmation", (data) => {
      setLoading(false);

      setLocalStorage(
        "SteamGuardCode",
        {
          confirmation: data.message,
        },
        data.message.timeoutSeconds
      );

      setConfirmation(data.message);
    });

    ws.on("error", (error) => {
      if (getLocalStorage("ignoreLogonWasNotConfirmed") && error.message === "LogonWasNotConfirmed") {
        return;
      }

      setLoading(false);
      setError(error.message);

      if (error.message === "LogonWasNotConfirmed") {
        setConfirmation(null);
      }
    });

    // load previous session
    const session = getLocalStorage("SteamGuardCode");
    if (session) {
      setConfirmation(session.confirmation);
    }

    return () => {
      if (ws) {
        ws.removeAllListeners("steamaccount/waitingforconfirmation");
        ws.removeAllListeners("error");
      }
    };
  }, [ws]);

  if (loading) {
    return <WaitingOnSteam />;
  }

  return (
    <Container>
      {error && (
        <Row className={`mb-3 justify-content-center`} lg={2}>
          <AlertMessage message={error} variant={"danger"} />
        </Row>
      )}

      {confirmation && <ShowConfirmation confirmation={confirmation} accountName={accountName} setError={setError} />}
      {!confirmation && (
        <>
          <Row className={`mb-3 text-center`}>
            <h1>Steam Account credentials</h1>
            <h5 className="text-warning mt-3">
              You only get 5 tries within 1 hour so that Steam doesn&apos;t rate limit us. <br /> This includes
              successful and unsuccessful logins.
            </h5>
            <h5>You can revoke access from within the Steam app</h5>
            <h5>We do not save your password</h5>
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
      )}
    </Container>
  );
}

function ShowConfirmation(props: {
  confirmation: any;
  accountName: string;
  setError: Dispatch<SetStateAction<string>>;
}) {
  const [guardCode, setGuardCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [guardType, setGuardType] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const [alert, setAlert] = useState("");
  const ws = useContext(WebSocketContext);
  const router = useRouter();
  const addToast = useContext(ToastContext);

  function setCountDownInterval(initial: number) {
    let counter = initial - 1;
    const timeout = setInterval(() => {
      if (counter) setCountdown(counter--);
    }, 1000);
    setIntervalId(timeout);
  }

  useEffect(() => {
    if (props.confirmation.guardType) {
      setGuardType(props.confirmation.guardType);
    }

    if (props.confirmation.timeoutSeconds) {
      setCountDownInterval(props.confirmation.timeoutSeconds);
    }

    if (props.confirmation.guardType === "deviceConfirmation") {
      setAlert("Steam sent confirmation to your Steam app.");
    }
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.on("steamaccount/add", (data) => {
      if (data.success) {
        removeLocalStorage("SteamGuardCode");
        router.push("/dashboard");
      } else {
        addToast(data.message);
      }
    });

    ws.on("steamaccount/confirmed", () => {
      addToast("Steam Guard confirmed.");
    });

    ws.on("steamaccount/cancelconfirmation", () => removeLocalStorage("SteamGuardCode"));

    ws.on("error", (error) => {
      if (getLocalStorage("ignoreLogonWasNotConfirmed") && error.message === "LogonWasNotConfirmed") {
        return;
      }

      setLoading(false);
    });

    return () => {
      ws.removeAllListeners("steamaccount/add");
      ws.removeAllListeners("steamaccount/confirmed");
      ws.removeAllListeners("steamaccount/cancelconfirmation");
      ws.removeAllListeners("error");
    };
  }, [ws]);

  const submitGuardCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardCode) {
      return;
    }

    setLoading(true);

    ws?.send({
      type: "steamaccount/updatewithsteamguardcode",
      body: {
        code: guardCode,
        guardType: guardType,
        accountName: props.accountName,
      },
    });
  };

  if (loading) {
    return <WaitingOnSteam />;
  }

  return (
    <Container>
      <Row className={`mb-3 text-center`}>
        <h5>Timeout: {countdown} seconds</h5>
      </Row>
      {alert && (
        <Row className={`mb-3 justify-content-center`} lg={2}>
          <AlertMessage message={alert} variant={"warning"} />
        </Row>
      )}
      {!alert && (
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
      )}
      <CancelConfirmation accountName={props.accountName} countdown={countdown} />
    </Container>
  );
}
