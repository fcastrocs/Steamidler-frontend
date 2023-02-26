import { useRouter } from "next/router";
import React, { useContext, useState, useEffect, createContext, Dispatch, SetStateAction } from "react";
import {
  Container,
  Row,
  Card,
  OverlayTrigger,
  Tooltip,
  Col,
  Button,
  DropdownButton,
  Dropdown,
  Modal,
  Form,
} from "react-bootstrap";
import { DashboardContext } from "../../../pages/dashboard";
import CustomSpinner from "../../Spinner";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import styles from "../../../styles/dashboard/Index.module.css";
import { SteamAccount } from "@machiavelli/steam-client";

type ContextType = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  updateAccount: (account: SteamAccount) => void;
  loading: boolean;
};
export const SteamAccountContext = createContext({} as ContextType);

function SteamAccounts() {
  const ws = useContext(WebSocketContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addToast = useContext(ToastContext);
  const { steamAccounts, setSteamAccounts } = useContext(DashboardContext);

  function updateAccount(newAccount: SteamAccount) {
    setSteamAccounts((oldAccounts) => {
      return oldAccounts.map((account) => {
        if (account.accountName === newAccount.accountName) {
          return newAccount;
        }
        return account;
      });
    });
  }

  function removeAccount(accountName: string) {
    setSteamAccounts((oldAccounts) => {
      return oldAccounts.filter((account) => account.accountName !== accountName);
    });
  }

  useEffect(() => {
    if (!ws) return;

    ws.on("steamaccount/personastatechanged", (data) => {
      const steamAccount = data.message as SteamAccount;
      updateAccount(steamAccount);
      addToast(`State changed for ${steamAccount.accountName}`);
    });

    ws.on("steamaccount/logout", (data) => {
      if (data.success) {
        updateAccount(data.message);
        addToast("Logout successful.");
        setLoading(false);
      }
    });

    ws.on("steamaccount/login", (data) => {
      if (data.success) {
        updateAccount(data.message);
        addToast("Login successful.");
        setLoading(false);
      } else {
        addToast(data.message);
      }
    });

    ws.on("steamaccount/remove", (data) => {
      if (data.success) {
        removeAccount(data.message);
        setLoading(false);
        addToast("Account deleted.");
      } else {
        addToast(data.message);
      }
    });

    ws.on("steamweb/changeavatar", (data) => {
      if (data.success) setLoading(false);
    });

    ws.on("steamclient/changeplayername", (data) => {
      if (data.success) setLoading(false);
    });

    ws.on("error", (error) => {
      setLoading(false);
      addToast(error.message);
    });

    return () => {
      ws.removeAllListeners("steamaccount/personastatechanged");
      ws.removeAllListeners("steamaccount/logout");
      ws.removeAllListeners("steamaccount/login");
      ws.removeAllListeners("steamaccount/remove");
      ws.removeAllListeners("steamweb/changeavatar");
      ws.removeAllListeners("steamclient/changeplayername");
      ws.removeAllListeners("error");
    };
  }, [ws]);

  return (
    <SteamAccountContext.Provider value={{ setLoading, updateAccount, loading }}>
      <Container>
        <Row md={2} className="justify-content-center">
          {steamAccounts.map((s) => {
            return (
              <Card
                key={s.steamId}
                style={{ width: "200px", height: "358px" }}
                className={`${styles[`card${s.state.status}`]} ${styles.card} ${styles[`border${s.state.status}`]} p-0`}
              >
                <Row>
                  <Avatar s={s} />
                </Row>

                <Card.Body className={`pt-0 d-flex flex-column`}>
                  {/* account status */}
                  <Row className={`mb-1 ${styles.status} ${styles[`status${s.state.status}`]} justify-content-center`}>
                    {s.state.status}
                  </Row>

                  {/* player name */}
                  <Row className="mb-1">
                    <PlayerName s={s} />
                  </Row>

                  {/* account name */}
                  <Row className="mb-1">
                    <div className="text-truncate">{s.accountName}</div>
                  </Row>

                  <hr className="m-0 p-0" />

                  {/* loading spinner */}
                  {loading && (
                    <Row className="align-items-center justify-content-center flex-grow-1">
                      <CustomSpinner />
                    </Row>
                  )}

                  {!loading && (
                    <Row className="justify-content-center flex-grow-1">
                      {/* farming and idling status */}

                      {/* actions buttons */}
                      {(s.state.status === "online" || s.state.status === "ingame") && (
                        <>
                          <Row>Farming: {s.state.farming ? "on" : "off"}</Row>
                          <Row className="mb-1">Idling: {s.state.gamesIdsIdle.length ? "on" : "off"}</Row>
                          <Row md={3} className={`mb-2 gx-1`}>
                            <Col className="d-flex justify-content-center">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  router.push(`dashboard/idle/${s.steamId}`);
                                }}
                              >
                                Idle
                              </Button>
                            </Col>
                            <Col className="d-flex justify-content-center">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  router.push(`dashboard/farm/${s.steamId}`);
                                }}
                              >
                                Farm
                              </Button>
                            </Col>
                            <Col className="d-flex justify-content-center">
                              <Button variant="primary" size="sm">
                                Trade
                              </Button>
                            </Col>
                          </Row>
                        </>
                      )}

                      {/* Steamaccount buttons */}
                      <Row md={2}>
                        <DropdownButton title="Client" variant="primary" size="sm">
                          <LogInBtn s={s} />
                          <LogOutBtn s={s} />
                          <AuthenticateBtn s={s} />
                          <DeleteBtn s={s} />
                          <hr />
                          <Activatef2pGame s={s} />
                          <ReedemCDKEY s={s} />
                        </DropdownButton>

                        {(s.state.status === "online" || s.state.status === "ingame") && (
                          <DropdownButton title="Web" variant="primary" size="sm">
                            <></>
                          </DropdownButton>
                        )}
                      </Row>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>
    </SteamAccountContext.Provider>
  );
}

function LogOutBtn(props: { s: SteamAccount }) {
  const { setLoading } = useContext(SteamAccountContext);
  const ws = useContext(WebSocketContext);

  function logout(accountName: string) {
    setLoading(true);
    ws?.send({ type: "steamaccount/logout", body: { accountName } });
  }

  return (
    <>
      {/* only render when accout is online or ingame */}
      {(props.s.state.status === "online" || props.s.state.status === "ingame") && (
        <Dropdown.Item onClick={() => logout(props.s.accountName)}>Logout</Dropdown.Item>
      )}
    </>
  );
}

function LogInBtn(props: { s: SteamAccount }) {
  const { setLoading } = useContext(SteamAccountContext);
  const ws = useContext(WebSocketContext);

  function login(accountName: string) {
    setLoading(true);
    ws?.send({ type: "steamaccount/login", body: { accountName } });
  }

  return (
    <>
      {/* only render when accout is offline */}
      {props.s.state.status === "offline" && (
        <Dropdown.Item onClick={() => login(props.s.accountName)}>Login</Dropdown.Item>
      )}
    </>
  );
}

function DeleteBtn(props: { s: SteamAccount }) {
  const { setLoading } = useContext(SteamAccountContext);
  const ws = useContext(WebSocketContext);

  function remove(accountName: string) {
    const response = confirm("Are you sure you want to delete this account?");

    if (response) {
      setLoading(true);
      ws?.send({ type: "steamaccount/remove", body: { accountName } });
    }
  }

  return <Dropdown.Item onClick={() => remove(props.s.accountName)}>Delete</Dropdown.Item>;
}

function AuthenticateBtn(props: { s: SteamAccount }) {
  const { setLoading } = useContext(SteamAccountContext);
  const ws = useContext(WebSocketContext);

  function authenticate(accountName: string) {
    setLoading(true);
  }

  return <>{props.s.state.status === "AccessDenied" && <Dropdown.Item>Authenticate</Dropdown.Item>}</>;
}

/**
 * Change Steam Avatar
 */
function Avatar(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const addToast = useContext(ToastContext);
  const { setLoading, loading } = useContext(SteamAccountContext);

  async function change(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files?.length) return;
    const image = e.target.files[0];
    const avatarDataURL = await base64FromBlob(image);
    sendRequest(avatarDataURL as string);
  }

  function drop(e: React.DragEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    const url = e.dataTransfer.getData("text") as string;
    if (!isValidUrl(url)) {
      return addToast("Not an image.");
    }
    sendRequest(url);
  }

  const sendRequest = (avatarDataURL: string) => {
    setLoading(true);
    ws?.send({ type: "steamweb/changeavatar", body: { accountName: props.s.accountName, avatarDataURL } });
  };

  const isValidUrl = (url: string) => {
    try {
      return Boolean(new URL(url));
    } catch (e) {
      return false;
    }
  };

  const base64FromBlob = async (blob: Blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <OverlayTrigger
      overlay={<Tooltip style={{ position: "fixed" }}>Drag & Drop image or click to upload</Tooltip>}
      placement="bottom"
    >
      <Col>
        <input
          title=""
          type="file"
          accept="image/jpeg, image/x-png"
          onChange={change}
          onDrop={drop}
          onDragOver={(e) => handleDragOver(e)}
          className="mx-2"
          style={{ height: "150px", position: "absolute", opacity: 0 }}
          disabled={loading}
        />
        <Card.Img src={props.s.data.state.avatarString} width={200} height={150} />
      </Col>
    </OverlayTrigger>
  );
}

/**
 * Change playername
 */
function PlayerName(props: { s: SteamAccount }) {
  const addToast = useContext(ToastContext);
  const ws = useContext(WebSocketContext);
  const { setLoading, loading } = useContext(SteamAccountContext);

  function playerNameChange(e: React.ChangeEvent<HTMLHeadingElement>) {
    const newPlayerName = e.target.innerText;

    if (newPlayerName === props.s.data.state.playerName) return;

    if (!newPlayerName) {
      e.target.innerText = props.s.data.state.playerName;
      return addToast("Player name cannot be blank.");
    }

    if (newPlayerName.length < 1 || newPlayerName.length > 32) {
      e.target.innerText = props.s.data.state.playerName;
      return addToast("Error: Your Profile Name must be between 1 and 32 characters in length.");
    }

    setLoading(true);

    ws?.send({
      type: "steamaccount/changeplayername",
      body: { accountName: props.s.accountName, playerName: newPlayerName },
    });
  }

  // blur on enter
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") e.target.blur();
  };

  return (
    <OverlayTrigger overlay={<Tooltip style={{ position: "fixed" }}>Click to player name</Tooltip>} placement="bottom">
      <h6
        className={`text-center ${styles.title} ${styles.clickable} text-truncate`}
        suppressContentEditableWarning
        contentEditable={!loading && (props.s.state.status === "online" || props.s.state.status === "ingame")}
        onBlur={playerNameChange}
        spellCheck="false"
        onKeyDown={handleKeyPress}
      >
        {props.s.data.state.playerName}
      </h6>
    </OverlayTrigger>
  );
}

function Activatef2pGame(props: { s: SteamAccount }) {
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

function ReedemCDKEY(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [cdkey, setCdkey] = useState("");
  const addToast = useContext(ToastContext);

  const activate = () => {
    setLoading(true);
    ws?.send({ type: "steamclient/cdkeyredeem", body: { accountName: props.s.accountName, cdkey } });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    console.log(e.target.value);
    setCdkey(e.target.value);
  };

  const reset = () => {
    setCdkey("");
    setLoading(false);
  };

  const handleClose = () => {
    ws?.removeListener("error", reset);
    ws?.removeAllListeners("steamclient/cdkeyredeem");
    setShow(false);
  };

  useEffect(() => {
    if (!ws) return;

    ws.on("steamclient/cdkeyredeem", (data) => {
      const games = data.message.games as SteamAccount["data"]["games"];
      addToast(`Success. ${games.length} game(s) redeemed.`);
      reset();
    });

    ws.on("error", reset);

    return () => {
      ws.removeListener("error", reset);
      ws.removeAllListeners("steamclient/cdkeyredeem");
    };
  }, [ws]);

  return (
    <>
      <Dropdown.Item onClick={() => setShow(true)}>Redeem CDKEY</Dropdown.Item>

      <Modal show={show} backdrop="static" keyboard={false} data-backdrop="static">
        <Modal.Header>
          <Modal.Title>Redeem CDKEY</Modal.Title>
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
                <Button variant="primary" onClick={activate} disabled={!cdkey}>
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

export default SteamAccounts;
