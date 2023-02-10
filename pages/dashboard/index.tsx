import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import AddSteamAccount from "../../components/Dashboard/AddSteamAccount";
import { WebSocketContext } from "../../components/WebSocketProvider";

const Dashboard: NextPage = () => {
  const firstUpdate = useRef(true);
  const [steamAccounts, setSteamAccounts] = useState([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const router = useRouter();
  const ws = useContext(WebSocketContext);

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/getall" });

    // get all accounts
    const interval = setInterval(() => {
      ws.send({ type: "steamaccount/getall" });
    }, 5000);

    // get all steam account
    ws.on("steamaccount/getall", (data) => {
      setSteamAccounts([]);
      setAccountsLoaded(true);
    });

    // state changed on a steam account
    ws.on("PersonaStateChanged", (data) => {
      console.log(data);
    });

    return () => clearInterval(interval);
  }, [ws]);

  if (!accountsLoaded && firstUpdate.current) {
    return <Spinner animation="border" />;
  }

  if (!steamAccounts.length) {
    router.push("/dashboard/addaccount");
  }

  return <></>;
};

export default Dashboard;
