import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { WebSocketContext } from "../../../components/WebSocketProvider";
import styles from "../../../styles/dashboard/Idle.module.css";
import _ from "underscore";
import CustomSpinner from "../../../components/Spinner";

const Idle: NextPage = () => {
  const router = useRouter();
  const { steamId } = router.query;
  const ws = useContext(WebSocketContext);
  const [s, setSteamAccount] = useState<any>();
  const [games, setGames] = useState<any>();
  const [gamesOriginal, setGamesOriginal] = useState<any>([]);
  const [gameIdsIdling, setGameIdsIdling] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(true);

  function resetAFterIdle(data: any) {
    // sort to show idling games first
    const tempGames = _.sortBy(games, (game) => {
      return game.isIdling;
    });
    setGameIdsIdling(data.message.gameIdsIdling);
    setGames([...tempGames]);
    setGamesOriginal([...tempGames]);
    setBtnDisabled(true);
    setLoading(false);
  }

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/get", body: { steamId } });

    ws.on("steamaccount/get", (data) => {
      const steamAccount = data.message;
      const gameIdsIdlingSet = new Set(steamAccount.state.gameIdsIdling);

      // set  idle property to games that are idling
      for (const game of steamAccount.data.games) {
        if (gameIdsIdlingSet.has(game.gameid)) {
          game.isIdling = true;
        }
      }

      // sort to show idling games first
      const tempGames = _.sortBy(steamAccount.data.games, (game) => {
        return game.isIdling;
      });

      setSteamAccount(steamAccount);
      setGames(tempGames);
      setGamesOriginal([...tempGames]);
      setGameIdsIdling(steamAccount.state.gameIdsIdling);
    });

    return () => {
      ws.removeAllListeners("steamaccount/get");
      ws.removeAllListeners("steamaccount/idlegames");
    };
  }, [ws]);

  function gameClicked(gameId: number) {
    // set idling property to game
    const index = _.findIndex(games, (game) => game.gameid === gameId);
    let gamesCopy = JSON.parse(JSON.stringify(games));
    gamesCopy[index].isIdling = !gamesCopy[index].isIdling;

    const difference = _.filter(gamesCopy, function (game) {
      return !_.findWhere(gamesOriginal, game);
    });

    if (difference.length) {
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
    }

    setGames(gamesCopy);
  }

  function setIdle() {
    // get gameIds of games that will idle
    const gameIds = games
      .filter((game: any) => {
        if (game.isIdling) return game.gameid;
      })
      .map((game: any) => {
        return game.gameid;
      });

    setBtnDisabled(false);
    setLoading(true);
    ws?.send({ type: "steamaccount/idlegames", body: { accountName: s.accountName, gameIds } });

    ws?.on("steamaccount/idlegames", function (data) {
      resetAFterIdle(data);
    });
  }

  if (!s || loading) {
    return <CustomSpinner />;
  }

  return (
    <Container>
      <Row>
        <h2 className="text-center">Select games to idle</h2>
      </Row>
      <Row>Account: {s.accountName}</Row>
      <Row>Games: {games.length}</Row>
      <Row>Games idling: {gameIdsIdling.length} / 30</Row>
      <Row className="my-2">
        <Button onClick={setIdle} disabled={btnDisabled}>
          Set Idle
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
