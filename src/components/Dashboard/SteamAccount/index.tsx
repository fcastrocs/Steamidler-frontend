import { useRouter } from "next/router";
import React, { useContext, useState, useEffect, createContext, Dispatch, SetStateAction } from "react";
import { Container, Row, Card, Col, Button, DropdownButton } from "react-bootstrap";
import { DashboardContext } from "../../../pages/dashboard";
import CustomSpinner from "../../Spinner";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import styles from "../../../styles/dashboard/Index.module.css";
import { SteamAccount } from "@machiavelli/steam-client";
import LogInBtn from "./LogInBtn";
import LogOutBtn from "./LogOutBtn";
import AuthenticateBtn from "./AuthenticateBtn";
import DeleteBtn from "./DeleteBtn";
import ReedemCDKEY from "./ReedemCDKEY";
import Avatar from "./Avatar";
import PlayerName from "./PlayerName";
import Activatef2pGame from "./Activatef2pGame";
import ClearAliases from "./clearAliases";
import ChangePrivacy from "./ChangePrivacy";
import ChangeState from "./ChangeState";
import ReloadAvatarFrame from "./ReloadAvatarFrame";

type ContextType = Map<string, { loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>> }>;
export const SteamAccountContext = createContext({} as ContextType);

function SteamAccounts() {
  const ws = useContext(WebSocketContext);
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

    ws.on("steamaccount/logout", (data) => {
      if (data.success) {
        updateAccount(data.message);
        addToast("Logout successful.");
      }
    });

    ws.on("steamaccount/login", (data) => {
      if (data.success) {
        updateAccount(data.message);
        addToast("Login successful.");
      } else {
        addToast(data.message);
      }
    });

    ws.on("steamaccount/personastatechanged", (data) => {
      const steamAccount = data.message as SteamAccount;
      updateAccount(steamAccount);
      addToast(`State changed for ${steamAccount.accountName}`);
    });

    ws.on("steamaccount/remove", (data) => {
      if (data.success) {
        removeAccount(data.message);
        addToast("Account deleted.");
      } else {
        addToast(data.message);
      }
    });

    ws.on("steamweb/getavatarframe", (data) => {
      const steamAccount = data.message as SteamAccount;
      updateAccount(steamAccount);
      addToast(`Account updated ${steamAccount.accountName}`);
    });

    ws.on("error", (error) => {
      addToast(error.message);
    });

    return () => {
      ws.removeAllListeners("steamaccount/personastatechanged");
      ws.removeAllListeners("steamaccount/logout");
      ws.removeAllListeners("steamaccount/login");
      ws.removeAllListeners("steamaccount/remove");
      ws.removeAllListeners("steamweb/changeavatar");
      ws.removeAllListeners("steamclient/changeplayername");
      ws.removeAllListeners("steamweb/clearaliases");
      ws.removeAllListeners("error");
    };
  }, [ws]);

  return (
    <SteamAccountContext.Provider value={new Map()}>
      <Container>
        <Row md={2} className="justify-content-center">
          {steamAccounts.map((s) => {
            return <SteamAccount s={s} key={s.steamId} />;
          })}
        </Row>
      </Container>
    </SteamAccountContext.Provider>
  );
}

function SteamAccount(props: { s: SteamAccount }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ws = useContext(WebSocketContext);
  const propsMap = useContext(SteamAccountContext);
  propsMap.set(props.s.steamId, { loading, setLoading });

  useEffect(() => {
    if (!ws) return;

    ws.on("steamaccount/logout", (data) => {
      if (data.success) {
        if ((data.message as SteamAccount).steamId !== props.s.steamId) {
          return;
        }
        setLoading(false);
      }
    });

    ws.on("steamaccount/login", (data) => {
      if (data.success) {
        if ((data.message as SteamAccount).steamId !== props.s.steamId) {
          return;
        }
        setLoading(false);
      }
    });

    ws.on("steamaccount/remove", (data) => {
      if (data.success) {
        if ((data.message as SteamAccount).steamId !== props.s.steamId) {
          return;
        }
        setLoading(false);
      }
    });

    ws.on("steamweb/getavatarframe", (data) => {
      if (data.success) {
        if ((data.message as SteamAccount).steamId !== props.s.steamId) {
          return;
        }
        setLoading(false);
      }
    });

    ws.on("steamweb/changeavatar", (data) => {
      if (data.success) setLoading(false);
    });

    ws.on("steamclient/changeplayername", (data) => {
      if (data.success) setLoading(false);
    });

    ws.on("steamweb/clearaliases", (data) => {
      if (data.success) setLoading(false);
    });

    ws.on("error", () => {
      setLoading(false);
    });
  }, [ws]);

  return (
    <Card
      className={`${styles[`card${props.s.state.status}`]} ${styles.card} ${
        styles[`border${props.s.state.status}`]
      } p-0`}
    >
      <Row className="p-0 m-0">
        <Avatar s={props.s} />
      </Row>

      <Card.Body className={`d-flex flex-column ${styles.cardbody}`}>
        {/* account status */}
        <Row className={`mb-1 ${styles.status} ${styles[`status${props.s.state.status}`]} justify-content-center`}>
          {props.s.state.status}
        </Row>

        {/* player name */}
        <Row className="mb-1 p-1">
          <PlayerName s={props.s} />
        </Row>

        {/* account name */}
        <Row className="mb-1">
          <div
            className="text-truncate"
            onClick={() => {
              window.open(`https://steamcommunity.com/profiles/${props.s.steamId}`);
            }}
          >
            {props.s.accountName}
          </div>
        </Row>

        <hr className="m-0 p-1" />

        {/* loading spinner */}
        {loading && (
          <Row className="align-items-center justify-content-center flex-grow-1">
            <CustomSpinner />
          </Row>
        )}

        {!loading && (
          <Row className="justify-content-center flex-grow-1">
            {(props.s.state.status === "online" || props.s.state.status === "ingame") && (
              <>
                {/* farming and idling status */}
                <Row>
                  Farming: {props.s.state.gamesIdsFarm.length && props.s.state.status === "ingame" ? "on" : "off"}
                </Row>
                <Row className="mb-1">
                  Idling: {props.s.state.gamesIdsIdle.length && props.s.state.status === "ingame" ? "on" : "off"}
                </Row>

                <hr className="m-0 p-1" />

                {/* actions buttons */}
                <Row md={3} className={`mb-2 gx-1`}>
                  <Col className="d-flex justify-content-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        router.push(`dashboard/idle/${props.s.steamId}`);
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
                        router.push(`dashboard/farm/${props.s.steamId}`);
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
                <LogInBtn s={props.s} />
                <LogOutBtn s={props.s} />
                <AuthenticateBtn s={props.s} />
                <DeleteBtn s={props.s} />
                <hr />
                <ChangeState s={props.s} />
                <Activatef2pGame s={props.s} />
                <ReedemCDKEY s={props.s} />
              </DropdownButton>

              {(props.s.state.status === "online" || props.s.state.status === "ingame") && (
                <DropdownButton title="Web" variant="primary" size="sm">
                  <ClearAliases s={props.s} />
                  <ChangePrivacy s={props.s} />
                  <ReloadAvatarFrame s={props.s} />
                </DropdownButton>
              )}
            </Row>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

export default SteamAccounts;
