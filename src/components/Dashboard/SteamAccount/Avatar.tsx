import { SteamAccount } from "@machiavelli/steam-client";
import { Dispatch, SetStateAction, useContext } from "react";
import { Card, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { SteamAccountContext } from ".";
import { ToastContext } from "../../../providers/ToastProvider";
import { WebSocketContext } from "../../../providers/WebSocketProvider";

export default function Avatar(props: { s: SteamAccount }) {
  const ws = useContext(WebSocketContext);
  const addToast = useContext(ToastContext);
  const { loading, setLoading } = useContext(SteamAccountContext).get(props.s.steamId) as {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
  };

  async function change(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files?.length) return;
    const image = e.target.files[0];
    const avatarDataURL = await base64FromBlob(image);
    sendRequest(avatarDataURL as string);
  }

  function drop(e: React.DragEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    const url = e.dataTransfer.getData("text") as string;
    if (!isValidUrl(url)) {
      return addToast("Not an image.");
    }
    sendRequest(url);
  }

  const sendRequest = (avatarDataURL: string) => {
    setLoading(true);
    ws?.send({ type: "steamweb/changeavatar", body: { accountName: props.s.accountName, avatarDataURL } });
  };

  const isValidUrl = (url: string) => {
    try {
      return Boolean(new URL(url));
    } catch (e) {
      return false;
    }
  };

  const base64FromBlob = async (blob: Blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <OverlayTrigger
      overlay={<Tooltip style={{ position: "fixed" }}>Drag & Drop image or click to upload</Tooltip>}
      placement="bottom"
    >
      <Col>
        <input
          title=""
          type="file"
          accept="image/jpeg, image/x-png"
          onChange={change}
          onDrop={drop}
          onDragOver={(e) => handleDragOver(e)}
          className="mx-2"
          style={{ height: "150px", position: "absolute", opacity: 0 }}
          disabled={loading}
        />
        <Card.Img src={props.s.data.state.avatarString} width={200} height={150} />
      </Col>
    </OverlayTrigger>
  );
}
