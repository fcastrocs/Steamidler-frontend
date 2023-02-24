import { useRouter } from "next/router";
import { useState, useContext, useEffect, SetStateAction, Dispatch } from "react";
import { Row, Form, InputGroup, Button } from "react-bootstrap";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../../../commons";
import { AddSteamContext } from "../../../pages/dashboard/addaccount";
import AlertMessage from "../../Alert";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import CancelButton from "./CancelButton";
import { WaitingOnSteam } from "./WaitingOnSteam";

export default function SteamGuardCode() {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const ws = useContext(WebSocketContext);
  const addSteamContext = useContext(AddSteamContext);

  function sendAdd() {
    setError("");
    setLoading(true);
    addSteamContext.setSuccess("");

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

    ws.on("steamaccount/waitingForConfirmation", (data) => {
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
        ws.removeAllListeners("steamaccount/waitingForConfirmation");
        ws.removeAllListeners("error");
      }
    };
  }, [ws]);

  if (loading) {
    return <WaitingOnSteam />;
  }

  return (
    <>
      {error && (
        <Row className={`mb-3 justify-content-center`} lg={2}>
          <AlertMessage message={error} variant={"danger"} />
        </Row>
      )}

      {confirmation && <ShowConfirmation confirmation={confirmation} accountName={accountName} setError={setError} />}
      {!confirmation && (
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
      )}
    </>
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
  const addSteamContext = useContext(AddSteamContext);
  const router = useRouter();

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
        addSteamContext.setSuccess("Account added successfully.");
        addSteamContext.setAuthType("");
      } else {
      }
    });

    ws.on("steamaccount/confirmedByUser", () => removeLocalStorage("SteamGuardCode"));
    ws.on("steamaccount/cancelConfirmation", () => removeLocalStorage("SteamGuardCode"));

    ws.on("error", (error) => {
      if (getLocalStorage("ignoreLogonWasNotConfirmed") && error.message === "LogonWasNotConfirmed") {
        return;
      }

      setLoading(false);
    });

    return () => {
      ws.removeAllListeners("steamaccount/add");
      ws.removeAllListeners("steamaccount/confirmedByUser");
      ws.removeAllListeners("steamaccount/cancelConfirmation");
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
      type: "steamaccount/updateWithSteamGuardCode",
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
    <>
      <Row className={`mb-3 text-center`}>
        <h6>Timeout: {countdown} seconds</h6>
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
      <CancelButton accountName={props.accountName} countdown={countdown} />
    </>
  );
}
