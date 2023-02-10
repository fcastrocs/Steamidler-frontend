import { createContext, useContext, useEffect, useRef, useState } from "react";
import WS from "../WebSocket";
import { AuthContext } from "./AuthProvider";
export const WebSocketContext = createContext<WS | null>(null);

function WebSocketProvider(props: { children: JSX.Element[] }) {
  const auth = useContext(AuthContext);
  const [ws, setWs] = useState<null | WS>(null);

  function cleanup() {
    if (ws) {
      ws.removeAllListeners();
      ws.close();
    }
  }

  useEffect(() => {
    // connect to WS
    if (auth.isLoggedIn) {
      const tempWs = new WS("ws://localhost:8000");
      tempWs.on("connected", () => setWs(tempWs));
    }

    // clean up on logout
    if (!auth.isLoggedIn) cleanup();
  }, [auth.isLoggedIn]);

  return <WebSocketContext.Provider value={ws}>{props.children}</WebSocketContext.Provider>;
}

export default WebSocketProvider;
