import { SteamAccount } from "@fcastrocs/steamclient";
import { Dispatch, SetStateAction, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function LogInBtn(props: { s: SteamAccount }) {
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };
  const ws = useContext(WebSocketContext);

  function login(accountName: string) {
    setLoading(true);
    ws?.send({ type: "steamaccount/login", body: { accountName } });
  }

  return (
    <>
      {/* only render when accout is offline */}
      {props.s.state.status === "offline" && (
        <Dropdown.Item onClick={() => login(props.s.accountName)}>Login</Dropdown.Item>
      )}
    </>
  );
}
