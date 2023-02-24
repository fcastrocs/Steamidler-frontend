import { useRouter } from "next/router";
import React, { useContext, useState, useEffect, createContext, Dispatch, SetStateAction } from "react";
import { Container, Row, Card, OverlayTrigger, Tooltip, Col, Button, DropdownButton, Dropdown } from "react-bootstrap";
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

    ws.on("PersonaStateChanged", (data) => {
      const steamAccount = data.message as SteamAccount;
      updateAccount(steamAccount);
      addToast(`State changed for ${steamAccount.accountName}`);
    });

    ws.on("steamaccount/logout", (data) => {
      if (data.success) {
        updateAccount(data.message);
        setLoading(false);
      }
    });

    ws.on("steamaccount/login", (data) => {
      if (data.success) {
        updateAccount(data.message);
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

    ws.on("steamaccount/changeplayername", (data) => {
      if (data.success) setLoading(false);
    });

    ws.on("error", (error) => {
      setLoading(false);
      addToast(error.message);
    });

    return () => {
      ws.removeAllListeners("PersonaStateChanged");
      ws.removeAllListeners("steamaccount/login");
      ws.removeAllListeners("steamaccount/logout");
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

                {/* </OverlayTrigger> */}

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
                              <Button variant="primary" size="sm">
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

                      {/*  */}
                      <Row>
                        <Col className="d-flex justify-content-center align-items-center">
                          <DropdownButton title="Actions" variant="primary" size="sm">
                            <LogInBtn s={s} />
                            <LogOutBtn s={s} />
                            <AuthenticateBtn s={s} />
                            <DeleteBtn s={s} />
                          </DropdownButton>
                        </Col>
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

export default SteamAccounts;
