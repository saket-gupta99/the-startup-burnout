import { FaPlay, FaUserFriends } from "react-icons/fa";
import Button from "../components/Button";
import { useWebSocketContext } from "../context/WebSocketContext";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function Home() {
  const { ws, ready, globalError, setGlobalError, roomCode, setRoomCode } =
    useWebSocketContext();
  const [roomData, setRoomData] = useState<{ name: string; roomCode: string }>({
    name: "",
    roomCode: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!ws) return;

    function handleMessage(e: MessageEvent) {
      const msg = JSON.parse(e.data);

      if (msg.type === "roomCode-generated") {
        setRoomCode(msg.roomCode);
        setRoomData((prev) => ({ ...prev, roomCode: msg.roomCode }));
        localStorage.setItem("createdRoomCode", msg.roomCode);
      }

      if (msg.type === "error") {
        console.log(msg.message)
        setGlobalError(msg.message);
      }
    }

    ws.addEventListener("message", handleMessage);

    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, setGlobalError, setRoomCode]);

  function getRoomCode() {
    if (!ws) {
      toast.error("Connecting to server...Please wait!");
      return;
    }
    ws.send(JSON.stringify({ type: "generate-roomCode" }));
  }

  function handleClickText() {
    navigator.clipboard.writeText(roomCode);
    toast("copied to clipboard");
  }

  function takeToLobby() {
    if (!ws) return;
    const trimmedName = roomData.name.trim();
    if (!roomData.roomCode || !trimmedName) {
      toast.error("Enter room code and your name");
      return;
    }

    setGlobalError("");
    navigate(
      {
        pathname: `/lobby/${roomData.roomCode}`,
        search: `?name=${encodeURIComponent(trimmedName)}`,
      },
      {
        replace: true,
      }
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col h-screen w-full justify-center items-center">
        <Spinner size={60} />
        <p className="font-semibold text-gray-600 mt-3">
          Please wait while the server is starting (around 50s)...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-10 px-4 py-10 md:flex-row md:py-16">
        {/* Left: text + form */}
        <section className="w-full md:w-1/2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Real-time party game
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            The Startup: <span className="text-amber-500">Burnout</span>
          </h1>

          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Create a room, share the code, and play together in real time. One
            spy, many interns, and a ticking deadline.
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <FaPlay className="text-amber-500" />
              <span>Start a game with your friends</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUserFriends className="text-sky-500" />
              <span>Join an existing room with a code</span>
            </div>
          </div>

          {/* Form card */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
            {/* Global error banner */}
            {globalError && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <span>{globalError}</span>
                <button
                  type="button"
                  onClick={() => setGlobalError("")}
                  className="text-xs font-semibold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form className="space-y-4">
              {/* Create room */}
              <Button
                onClick={getRoomCode}
                disabled={!ws || ws.readyState !== WebSocket.OPEN}
              >
                <FaPlay />
                <span>Create New Room</span>
              </Button>
              {roomCode && (
                <div className="flex justify-between items-center bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-gray-700">
                  <span className="font-mono text-sm">{roomCode}</span>
                  <Button
                    variant="basic"
                    className="text-sm"
                    onClick={handleClickText}
                  >
                    Copy
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-3 text-sm sm:flex-row">
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  value={roomData.name ?? ""}
                  onChange={(e) =>
                    setRoomData((roomData) => ({
                      ...roomData,
                      name: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Enter room code"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  value={roomData.roomCode ?? ""}
                  onChange={(e) =>
                    setRoomData((roomData) => ({
                      ...roomData,
                      roomCode: e.target.value,
                    }))
                  }
                />
              </div>

              <Button variant="secondary" onClick={takeToLobby}>
                <FaUserFriends />
                <span>Join Room</span>
              </Button>
            </form>

            <p className="mt-3 text-xs text-slate-500">
              1. Create a room • 2. Share the code • 3. Start the game
            </p>
          </div>
        </section>

        {/* Right: illustration */}
        <section className="w-full md:w-1/2">
          <div className="mx-auto max-w-sm">
            <img
              src="images/illustration-1.png"
              alt="People playing together online"
              className="w-full h-auto"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
