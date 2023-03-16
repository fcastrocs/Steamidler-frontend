import { SteamAccount } from "@fcastrocs/steamclient";
import { Dispatch, SetStateAction, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function DeleteBtn(props: { s: SteamAccount }) {
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };
  const ws = useContext(WebSocketContext);

  function remove(accountName: string) {
    const response = confirm("Are you sure you want to delete this account?");

    if (response) {
      setLoading(true);
      ws?.send({ type: "steamaccount/remove", body: { accountName } });
    }
  }

  return <Dropdown.Item onClick={() => remove(props.s.accountName)}>Delete</Dropdown.Item>;
}
