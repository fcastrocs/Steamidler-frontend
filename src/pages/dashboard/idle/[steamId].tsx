import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import styles from "../../../styles/dashboard/Idle.module.css";
import _ from "underscore";
import { SteamAccount } from "@fcastrocs/steamclient";
import { ToastContext } from "../../../providers/ToastProvider";
import AlertMessage from "../../../components/Alert";
import Spinner from "../../../components/Spinner";

const Idle: NextPage = () => {
  const router = useRouter();
  const { steamId } = router.query;
  const ws = useContext(WebSocketContext);
  const [s, setSteamAccount] = useState<SteamAccount>();
  const [games, setGames] = useState<SteamAccount["data"]["games"]>([]);
  const [gamesOriginal, setGamesOriginal] = useState<SteamAccount["data"]["games"]>([]);
  const [gamesIdsIdle, setGamesIdsIdle] = useState<number[]>([]);
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [forcePlay, setforcePlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const addToast = useContext(ToastContext);

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/get", body: { steamId } });

    ws.on("steamaccount/get", (data) => {
      const steamAccount = data.message as SteamAccount;
      if (steamAccount.data.playingState.playingBlocked) {
        steamAccount.state.gamesIdsIdle = [];
      }
      const gameIdsIdleSet = new Set(steamAccount.state.gamesIdsIdle);

      const idlingGames = [];
      let notIdlingGames = [];

      // set idle property to games that are idling
      for (const game of steamAccount.data.games) {
        game.isIdling = gameIdsIdleSet.has(game.gameid);
        if (game.isIdling) {
          idlingGames.push(game);
        } else {
          notIdlingGames.push(game);
        }
      }

      // sort to show idling games first
      notIdlingGames = _.sortBy(notIdlingGames, (game) => game.name);
      const tempGames = [...idlingGames, ...notIdlingGames];

      setSteamAccount(steamAccount);
      setGames(tempGames);
      setGamesOriginal(JSON.parse(JSON.stringify(tempGames)));
      setGamesIdsIdle(steamAccount.state.gamesIdsIdle);
      setLoading(false);
    });

    ws.on("steamclient/idlegames", (data) => {
      const s = data.message as SteamAccount;
      resetAFterdIle(s);
      addToast(`Idling ${s.state.gamesIdsIdle.length ? "started." : "stopped."}`);
    });

    ws.on("farming/stop", (data) => {
      setSteamAccount(data.message);
    });

    ws.on("error", (error) => {
      return addToast(error.message);
    });

    return () => {
      ws.removeAllListeners("steamaccount/get");
      ws.removeAllListeners("steamclient/idlegames");
      ws.removeAllListeners("farming/stop");
      ws.removeAllListeners("error");
    };
  }, [ws]);

  // change UI accordingly after game clicked
  function gameClicked(gameId: number) {
    setGames((games) => {
      return games.map((game) => {
        if (game.gameid === gameId) {
          game.isIdling = !game.isIdling;
        }
        return game;
      });
    });
  }

  // execute restrictions
  useEffect(() => {
    const gamesIdling = _.reduce(games, (idling, game) => idling + +game.isIdling, 0);
    if (gamesIdling >= 33) {
      setBtnDisabled(true);
      return addToast("Limit reached, you can only idle 2 games simultaneously.");
    }

    // only enable set idle btn if new idle differs from currentf
    const difference = _.filter(games, function (game) {
      return !_.findWhere(gamesOriginal, game);
    });

    setBtnDisabled(!difference.length);
  }, [games]);

  function setIdle() {
    // get gameIds of games that will idle
    const gameIds = games
      .filter((game) => {
        if (game.isIdling) return game.gameid;
      })
      .map((game) => {
        return game.gameid;
      });

    setBtnDisabled(true);
    ws?.send({ type: "steamclient/idlegames", body: { accountName: s?.accountName, gameIds, forcePlay } });
  }

  function stopIdle() {
    setGames((games) => {
      return games.map((game) => {
        game.isIdling = false;
        return game;
      });
    });
    ws?.send({ type: "steamclient/idlegames", body: { accountName: s?.accountName, gameIds: [], forcePlay } });
  }

  function resetAFterdIle(account: SteamAccount) {
    // sort to show idling games first
    setGames((games) => {
      const tempGames = _.sortBy(games, (game) => !game.isIdling);
      setGamesOriginal(JSON.parse(JSON.stringify(tempGames)));
      return tempGames;
    });

    setGamesIdsIdle(account.state.gamesIdsIdle);
  }

  function switchForceKickSession(e: any) {
    setforcePlay(e.target.checked);
  }

  function stopFarming() {
    ws?.send({ type: "farming/stop", body: { accountName: s?.accountName, gameIds: [] } });
  }

  if (loading) {
    return (
      <Container style={{ height: "100vh" }} className="d-flex justify-content-center align-items-center">
        <Spinner />;
      </Container>
    );
  }

  if (s && s.state.gamesIdsFarm.length) {
    return (
      <>
        <AlertMessage message="You must stop farming before you can idle." variant="warning" />;
        <Button onClick={stopFarming}>Stop Farming</Button>
      </>
    );
  }

  return (
    <Container>
      <Row>
        <h2 className="text-center">Select games to idle</h2>
      </Row>
      <Row>Account: {s?.accountName}</Row>
      <Row>Games: {games.length}</Row>
      <Row>Games idling: {gamesIdsIdle.length} / 30</Row>
      <Form>
        <Form.Check
          type="switch"
          label="Force kick other playing sessions"
          className="m-3 px-3"
          onClick={switchForceKickSession}
        />
      </Form>
      {/* Account is playing elsewhere */}
      {s?.data.playingState.playingBlocked && (
        <Row className="pt-2">
          <AlertMessage message="Account is playing elsewhere." variant="warning" />
        </Row>
      )}
      <Row className="my-3">
        <Button onClick={setIdle} disabled={btnDisabled} className={`mb-2`} variant="primary">
          Set Idle
        </Button>
        <Button onClick={stopIdle} disabled={!gamesIdsIdle.length} variant="danger">
          Stop Idling
        </Button>
      </Row>
      <Row md={6} className="justify-content-center">
        {games.map((game: any) => {
          return (
            <Col
              key={game.gameid}
              className={`m-2 text-center ${styles.clickable}`}
              onClick={() => {
                gameClicked(game.gameid);
              }}
            >
              <Image
                className={`${game.isIdling ? styles.idling : ""}`}
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.gameid}/header.jpg`}
                alt="game-logo"
                width={184}
                height={69}
                priority={game.gameid === 10}
              />
              <Row className={`justify-content-center ${game.isIdling ? styles["name-idling"] : ""}`}>{game.name}</Row>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default Idle;
