import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import styles from "../../../styles/dashboard/Idle.module.css";
import _ from "underscore";
import { SteamAccount } from "@machiavelli/steam-client";
import { ToastContext } from "../../../providers/ToastProvider";

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
  const addToast = useContext(ToastContext);

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/get", body: { steamId } });

    ws.on("steamaccount/get", (data) => {
      const steamAccount = data.message as SteamAccount;
      const gameIdsIdleSet = new Set(steamAccount.state.gamesIdsIdle);

      // set  idle property to games that are idling
      for (const game of steamAccount.data.games) {
        game.isIdling = gameIdsIdleSet.has(game.gameid);
      }

      // sort to show idling games first
      const tempGames = _.sortBy(steamAccount.data.games, (game) => !game.isIdling);

      setSteamAccount(steamAccount);
      setGames(tempGames);
      setGamesOriginal(JSON.parse(JSON.stringify(tempGames)));
      setGamesIdsIdle(steamAccount.state.gamesIdsIdle);
    });

    ws.on("steamclient/idlegames", function (data) {
      resetAFterdIle(data.message);
    });

    ws.on("error", (error) => {
      return addToast(error.message);
    });

    return () => {
      ws.removeAllListeners("steamaccount/get");
      ws.removeAllListeners("steamclient/idlegames");
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
    if (gamesIdling >= 2) {
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
      <Row className="my-2">
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
