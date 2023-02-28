import { SteamAccount } from "@machiavelli/steam-client";
import { Dispatch, SetStateAction, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function AuthenticateBtn(props: { s: SteamAccount }) {
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };
  const ws = useContext(WebSocketContext);

  function authenticate(accountName: string) {
    setLoading(true);
  }

  return <>{props.s.state.status === "AccessDenied" && <Dropdown.Item>Authenticate</Dropdown.Item>}</>;
}
