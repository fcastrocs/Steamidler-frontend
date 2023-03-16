import { SteamAccount } from "@fcastrocs/steamclient";
import { Dispatch, SetStateAction, useContext } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";
import styles from "../../../styles/dashboard/Index.module.css";

export default function PlayerName(props: { s: SteamAccount }) {
  const addToast = useContext(ToastContext);
  const ws = useContext(WebSocketContext);
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };

  function playerNameChange(e: React.ChangeEvent<HTMLHeadingElement>) {
    const newPlayerName = e.target.innerText;

    if (newPlayerName === props.s.data.state.playerName) return;

    if (!newPlayerName) {
      e.target.innerText = props.s.data.state.playerName;
      return addToast("Player name cannot be blank.");
    }

    if (newPlayerName.length < 1 || newPlayerName.length > 32) {
      e.target.innerText = props.s.data.state.playerName;
      return addToast("Error: Your Profile Name must be between 1 and 32 characters in length.");
    }

    setLoading(true);

    ws?.send({
      type: "steamclient/changeplayername",
      body: { accountName: props.s.accountName, playerName: newPlayerName },
    });
  }

  // blur on enter
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") e.target.blur();
  };

  return (
    <OverlayTrigger overlay={<Tooltip style={{ position: "fixed" }}>Click to player name</Tooltip>} placement="bottom">
      <h6
        className={`text-center ${styles.title} ${styles.clickable} text-truncate`}
        suppressContentEditableWarning
        contentEditable={!loading && (props.s.state.status === "online" || props.s.state.status === "ingame")}
        onBlur={playerNameChange}
        spellCheck="false"
        onKeyDown={handleKeyPress}
      >
        {props.s.data.state.playerName}
      </h6>
    </OverlayTrigger>
  );
}
