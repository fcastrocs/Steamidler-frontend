import { SteamAccount } from "@machiavelli/steam-client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import SteamAccounts from "../../components/Dashboard/SteamAccount";
import CustomSpinner from "../../components/Spinner";
import { WebSocketContext } from "../../providers/WebSocketProvider";

type ContextType = {
  steamAccounts: SteamAccount[];
  setSteamAccounts: React.Dispatch<React.SetStateAction<SteamAccount[]>>;
};
export const DashboardContext = createContext<ContextType>({} as ContextType);

const Dashboard: NextPage = () => {
  const firstUpdate = useRef(true);
  const [steamAccounts, setSteamAccounts] = useState<SteamAccount[]>([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const router = useRouter();
  const ws = useContext(WebSocketContext);

  useEffect(() => {
    if (!ws) return;

    ws.send({ type: "steamaccount/getall" });

    // get all steam account
    ws.once("steamaccount/getall", (data) => {
      setSteamAccounts(data.message);
      setAccountsLoaded(true);
    });

    return () => {
      ws.removeAllListeners("steamaccount/getall");
    };
  }, [ws]);

  if (!accountsLoaded && firstUpdate.current) {
    return <CustomSpinner />;
  }

  if (!steamAccounts.length) {
    router.push("/dashboard/addaccount");
  }

  return (
    <DashboardContext.Provider value={{ steamAccounts, setSteamAccounts }}>
      <SteamAccounts />
    </DashboardContext.Provider>
  );
};

export default Dashboard;
