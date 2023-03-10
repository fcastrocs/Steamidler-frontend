import { createContext, useContext, useEffect, useState } from "react";
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
    const url = process.env.NEXT_PUBLIC_API_URL ? `wss://${process.env.NEXT_PUBLIC_API_URL}` : "ws://localhost:8000";

    // connect to WS
    if (auth.isLoggedIn) {
      const tempWs = new WS(url);
      tempWs.on("connected", () => setWs(tempWs));
    }

    // clean up on logout
    if (!auth.isLoggedIn) cleanup();
  }, [auth.isLoggedIn]);

  return <WebSocketContext.Provider value={ws}>{props.children}</WebSocketContext.Provider>;
}

export default WebSocketProvider;
