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
import { FarmableGame } from "@machiavelli/steam-web";

const Idle: NextPage = () => {
  const router = useRouter();
  const { steamId } = router.query;
  const ws = useContext(WebSocketContext);
  const [s, setSteamAccount] = useState<SteamAccount>();
  const [games, setGames] = useState<FarmableGame[]>([]);
  const [gamesOriginal, setGamesOriginal] = useState<FarmableGame[]>([]);
  const [gamesIdsFarm, setGamesIdsFarm] = useState<number[]>([]);
  const [btnDisabled, setBtnDisabled] = useState(true);
  const addToast = useContext(ToastContext);

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/get", body: { steamId } });

    ws.on("steamaccount/get", (data) => {
      const steamAccount = data.message as SteamAccount;
      const gameIdsFarmSet = new Set(steamAccount.state.gamesIdsFarm);
      const farmableGames = steamAccount.data.farmableGames;

      let tempGames = [];

      for (const farmableGame of farmableGames) {
        const game = _.find(steamAccount.data.games, (game) => game.gameid === farmableGame.appId);
        farmableGame.isFarming = gameIdsFarmSet.has(farmableGame.appId);
        tempGames.push({ ...farmableGame, ...game });
      }

      // sort to show idling games first
      tempGames = _.sortBy(tempGames, (game) => !game.isFarming);

      setSteamAccount(steamAccount);
      setGames(tempGames);
      setGamesOriginal(JSON.parse(JSON.stringify(tempGames)));
      setGamesIdsFarm(steamAccount.state.gamesIdsFarm);
    });

    ws.on("farming/start", function (data) {
      resetAfterFarm(data.message.gameIds);
      addToast("Farming started.");
    });

    ws.on("farming/stop", function () {
      setGames((games) => {
        return games.map((game) => {
          game.isFarming = false;
          return game;
        });
      });

      addToast("Farming stopped.");
    });

    ws.on("error", (error) => {
      return addToast(error.message);
    });

    return () => {
      ws.removeAllListeners("steamaccount/get");
      ws.removeAllListeners("farming/start");
      ws.removeAllListeners("farming/stop");
      ws.removeAllListeners("error");
    };
  }, [ws]);

  // change UI accordingly after game clicked
  function gameClicked(gameId: number) {
    setGames((games) => {
      return games.map((game) => {
        if (game.gameid === gameId) {
          game.isFarming = !game.isFarming;
        }
        return game;
      });
    });
  }

  // execute restrictions
  useEffect(() => {
    const gamesIdling = _.reduce(games, (idling, game) => idling + +game.isFarming, 0);
    if (gamesIdling >= 2) {
      setBtnDisabled(true);
      return addToast("Limit reached, you can only farm 2 games simultaneously.");
    }

    // only enable set idle btn if new idle differs from currentf
    const difference = _.filter(games, function (game) {
      return !_.findWhere(gamesOriginal, game);
    });

    setBtnDisabled(!difference.length);
  }, [games]);

  function setFarm() {
    // get gameIds of games that will farm
    const gameIds = games
      .filter((game) => {
        if (game.isFarming) return game.gameid;
      })
      .map((game) => {
        return game.gameid;
      });

    setBtnDisabled(true);
    ws?.send({ type: "farming/start", body: { accountName: s?.accountName, gameIds } });
  }

  function stopFarm() {
    ws?.send({ type: "farming/stop", body: { accountName: s?.accountName, gameIds: [] } });
  }

  function resetAfterFarm(gameIds: number[]) {
    // sort to show farming games first
    setGames((games) => {
      const tempGames = _.sortBy(games, (game) => !game.isFarming);
      setGamesOriginal(JSON.parse(JSON.stringify(tempGames)));
      return tempGames;
    });

    setGamesIdsFarm(gameIds);
  }

  return (
    <Container>
      <Row>
        <h2 className="text-center">Select games to farm</h2>
      </Row>
      <Row>Account: {s?.accountName}</Row>
      <Row>Farmable games: {games.length}</Row>
      <Row>Games farming: {gamesIdsFarm.length} / 30</Row>
      <Row className="my-2">
        <Button onClick={setFarm} disabled={btnDisabled} className={`mb-2`} variant="primary">
          Set Farm
        </Button>
        <Button onClick={stopFarm} disabled={!gamesIdsFarm.length} variant="danger">
          Stop Farming
        </Button>
      </Row>
      {!games.length && <h4 className="text-center m-5">No games to farm.</h4>}
      {!!games.length && (
        <Row md={6} className="justify-content-center">
          {games.map((game) => {
            return (
              <Col
                key={game.gameid}
                className={`m-2 text-center ${styles.clickable}`}
                onClick={() => {
                  gameClicked(game.gameid);
                }}
              >
                <Image
                  className={`${game.isFarming ? styles.idling : ""}`}
                  src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.gameid}/header.jpg`}
                  alt="game-logo"
                  width={184}
                  height={69}
                  priority={game.gameid === 10}
                />
                <Row className={`justify-content-center ${game.isFarming ? styles["name-idling"] : ""}`}>
                  {game.name}
                </Row>
                <Row className={`justify-content-center ${game.isFarming ? styles["name-idling"] : ""}`} md={1}>
                  <Col>Remaining cards: {game.remainingCards}</Col>
                  <Col>Dropped cards: {game.droppedCards}</Col>
                  <Col>Played time: {game.playTime} hrs</Col>
                </Row>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Idle;
