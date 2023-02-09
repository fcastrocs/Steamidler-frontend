import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import WS from "../../WebSocket";

type ChildProps = {
  setAuthType: React.Dispatch<React.SetStateAction<"" | "QRcode" | "SteamGuardCode">>;
  ws: WS;
  qrCode: string;
};

const AddSteamAccount: NextPage<{ ws: WS }> = (props) => {
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const router = useRouter();

  const [authType, setAuthType] = useState<"QRcode" | "SteamGuardCode" | "">("");

  useEffect(() => {
    if (!authType) return;

    if (authType === "QRcode") {
      props.ws.send({
        type: "steamaccount/add",
        body: {
          authType: "QRcode",
        },
      });

      // props.ws.once("steamaccount/waitingForConfirmation", (message) => {
      //   console.log(message);
      //   // setQrCode(message.info.qrCode);
      // });

      props.ws.once("error", (message) => {});
    }
  }, [authType]);

  const childprops = {
    setAuthType,
    ws: props.ws,
    qrCode,
  };

  // show auth type selection
  if (!authType) {
    return <AuthTypeSelection {...childprops} />;
  }

  if (authType === "QRcode") {
    return <QRCode {...childprops} />;
  }

  if (authType === "SteamGuardCode") {
    return <SteamGuardCode {...childprops} />;
  }

  return <></>;
};

function AuthTypeSelection(props: ChildProps) {
  return (
    <div>
      <h3>Select authentication type</h3>
      <button
        onClick={() => {
          props.setAuthType("QRcode");
        }}
      >
        QR code
      </button>
      <button
        onClick={() => {
          props.setAuthType("SteamGuardCode");
        }}
      >
        SteamGuard Code
      </button>
    </div>
  );
}

function QRCode(props: ChildProps) {
  if (!props.qrCode) {
    return (
      <>
        <h3>WAITING ON QR CODE ...</h3>
        <Spinner animation="border" />;
      </>
    );
  }
  return (
    <div>
      <h3>Scan code with the Steam App</h3>
      <Image src={props.qrCode} height={250} width={250} alt={"qr code"} />
    </div>
  );
}

function SteamGuardCode(props: ChildProps) {
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [guardCode, setGuardCode] = useState("");

  useEffect(() => {
    props.ws.on("error", (error) => {
      setLoading(false);
      setError(error.message);
    });
  }, []);

  const formSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !accountName) {
      return;
    }

    props.ws.send({
      type: "steamaccount/add",
      body: {
        authType: "SteamGuardCode",
        accountName,
        password,
      },
    });

    props.ws.on("steamaccount/add", (data) => {
      if (data.success) {
        setLoading(false);
        setError("");
        setAlert("");
        setSuccess("Account added and is online.");
      } else {
       
      }
    });

    props.ws.once("steamaccount/waitingForConfirmation", (data) => {
      setLoading(false);
      if (data.message.guardType === "deviceConfirmation") {
        setAlert("Steam sent confirmation to your Steam app.");
      } else if (data.message.guardType.toLowerCase().includes("code")) {
        setShowCodeInput(true);
      }
    });

    setLoading(true);
  };

  const submitGuardCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardCode) {
      return;
    }

    setLoading(true);

    props.ws.send({
      type: "steamaccount/updateWithSteamGuardCode",
      body: {
        code: guardCode,
      },
    });
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (alert) {
    return (
      <Alert key={"warning"} variant={"warning"}>
        {alert}
      </Alert>
    );
  }

  if (showCodeInput) {
    return (
      <>
        {error && (
          <Alert key={"danger"} variant={"danger"}>
            {error}
          </Alert>
        )}

        <Form onSubmit={submitGuardCode}>
          <InputGroup className="mb-3">
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

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </>
    );
  }

  return (
    <>
      {error && (
        <Alert key={"danger"} variant={"danger"}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert key={"success"} variant={"success"}>
          {success}
        </Alert>
      )}

      <Form onSubmit={formSubmit}>
        <InputGroup className="mb-3">
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

        <InputGroup className="mb-3">
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

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit">
            Login
          </Button>
        </div>
      </Form>
    </>
  );
}

export default AddSteamAccount;
