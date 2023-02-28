import { SteamAccount } from "@machiavelli/steam-client";
import { Dispatch, SetStateAction, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function LogOutBtn(props: { s: SteamAccount }) {
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };
  const ws = useContext(WebSocketContext);

  function logout(accountName: string) {
    setLoading(true);
    ws?.send({ type: "steamaccount/logout", body: { accountName } });
  }

  return (
    <>
      {/* only render when accout is online or ingame */}
      {(props.s.state.status === "online" || props.s.state.status === "ingame") && (
        <Dropdown.Item onClick={() => logout(props.s.accountName)}>Logout</Dropdown.Item>
      )}
    </>
  );
}
