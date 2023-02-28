import { SteamAccount } from "@machiavelli/steam-client";
import { Dispatch, SetStateAction, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function ClearAliases(props: { s: SteamAccount }) {
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };
  const ws = useContext(WebSocketContext);

  function send(accountName: string) {
    setLoading(true);
    ws?.send({ type: "steamweb/clearaliases", body: { accountName } });
  }

  return <Dropdown.Item onClick={() => send(props.s.accountName)}>Clear Aliases</Dropdown.Item>;
}
