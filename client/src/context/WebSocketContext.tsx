import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
} from "react";
import { playSound } from "../libs/utils";

interface IWebSocketContext {
  ws: WebSocket | null;
  ready: boolean;
  globalError: string;
  setGlobalError: Dispatch<SetStateAction<string>>;
  roomCode: string;
  setRoomCode: Dispatch<SetStateAction<string>>;
  roomState: IRoomState | null;
  setRoomState: Dispatch<SetStateAction<IRoomState | null>>;
  mySocketId: string | null;
  hasRestartedGame: boolean;
  setHasRestartedGame: Dispatch<SetStateAction<boolean>>;
}

const WebSocketContext = createContext<IWebSocketContext>({
  ws: null,
  ready: false,
  globalError: "",
  setGlobalError: () => {},
  roomCode: "",
  setRoomCode: () => {},
  roomState: null,
  setRoomState: () => {},
  mySocketId: "",
  hasRestartedGame: false,
  setHasRestartedGame: () => {},
});

export default function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomState, setRoomState] = useState<IRoomState | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [hasRestartedGame, setHasRestartedGame] = useState(false);

  useEffect(() => {
    let currentWs: WebSocket;

    function connect() {
      currentWs = new WebSocket(
        import.meta.env.PROD ? "" : "ws://localhost:4000"
      );
      setReady(false);

      currentWs.onopen = () => {
        console.log("✅ connected");
        setReady(true);
      };

      currentWs.onclose = () => {
        console.log("❌ Disconnected, retrying in 2s...");
        setReady(false);
        setWs(null);
        setTimeout(connect, 2000);
      };

      currentWs.onmessage = (e: MessageEvent) => {
        const msg = JSON.parse(e.data);

        if (msg.type === "welcome") {
          setMySocketId(msg.socketId);
        }

        if (msg.type === "error") {
          playSound("/sounds/ui/error.mp3");
          setError(msg.message);
        }

        if (msg.type === "room-state") {
          setRoomState(msg.room);
        }

        if (msg.type === "voting-results") {
          setRoomState((prev) => ({ ...prev! })); // ensure re-render
          window.dispatchEvent(
            new CustomEvent("show-voting-results", { detail: msg.results })
          );
        }
      };

      setWs(currentWs);
    }

    connect();

    return () => {
      currentWs.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        ws,
        ready,
        globalError: error,
        setGlobalError: setError,
        roomCode,
        setRoomCode,
        roomState,
        setRoomState,
        mySocketId,
        hasRestartedGame,
        setHasRestartedGame,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("Cannot use outside WebContextProvider!");
  return context;
}
