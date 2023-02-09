import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import AddSteamAccount from "../../components/Dashboard/AddSteamAccount";
import WS from "../../WebSocket";

const Dashboard: NextPage = () => {
  const firstUpdate = useRef(true);
  const wsRef = useRef<WS | null>(null);
  const [steamAccounts, setSteamAccounts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const ws = new WS("ws://localhost:8000");
    wsRef.current = ws;

    ws.on("open", () => {
      ws.send({ type: "steamaccount/getall" });
    });

    // get all steam account
    ws.on("steamaccount/getall", (data) => {
      setSteamAccounts([]);
    });

    // state changed on a steam account
    ws.on("PersonaStateChanged", (data) => {
      console.log(data);
    });

    firstUpdate.current = false;

    return () => ws.close();
  }, []);

  if (!steamAccounts.length && firstUpdate.current) {
    return <Spinner animation="border" />;
  }

  if (!steamAccounts.length) {
    router.push("/dashboard/addaccount");
  }

  return <></>;
};

export default Dashboard;
