import { useEffect, useRef } from "react";
import { useWebSocketContext } from "../context/WebSocketContext";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { FaUsers, FaUserSecret, FaPlay, FaCopy } from "react-icons/fa";
import Button from "../components/Button";
import toast from "react-hot-toast";
import Error from "../components/Error";
import PlayerListPanel from "../components/PlayerListPanel";
import ActivityLogPanel from "../components/ActivityLogPanel";

export default function Lobby() {
  const { ws, ready, globalError, setRoomCode, roomState } =
    useWebSocketContext();
  const { roomCode } = useParams();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "";
  const isHost = localStorage.getItem("createdRoomCode") === roomCode;
  const hasSentRoomEventRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomCode) setRoomCode(roomCode);
  }, [roomCode, setRoomCode]);

  // if host trigger create-room event and for non-host join-room event
  useEffect(() => {
    if (!ws || !roomCode || !name) return;
    if (!ready || ws.readyState !== WebSocket.OPEN) return;

    //making sure event runs only 1 time for each player
    if (!hasSentRoomEventRef.current) {
      hasSentRoomEventRef.current = true;

      if (isHost) {
        ws.send(
          JSON.stringify({
            type: "create-room",
            roomCode,
            name,
          })
        );
      } else {
        ws.send(JSON.stringify({ type: "join-room", roomCode, name }));
      }
    }
  }, [ws, name, roomCode, ready, isHost]);

  //take everyone to game page when status changes to in-progress
  useEffect(() => {
    if (!roomState) return;
    if (roomState.roomCode !== roomCode) return;
    if (roomState.status === "in_progress") {
      navigate(`/game/${roomState.roomCode}`, { replace: true });
    }
  }, [roomState, navigate, roomCode]);

  function copyLink() {
    const shareLink = `${window.location.origin}/lobby/${roomCode}`;
    navigator.clipboard.writeText(shareLink);
    toast("copied to clipboard");
  }

  function startGame() {
    if (!roomState || !ws) return;
    if (roomState.players.length < 3) {
      toast.error("Game can only start with atleast 3 players!");
      return;
    }
    ws.send(JSON.stringify({ type: "start-game", roomCode }));
  }

  if (!isHost && !name) {
    return <Navigate to="/home" />;
  }

  if (globalError) {
    return <Error globalError={globalError} />;
  }

  return (
    <main className="min-h-dvh bg-white text-slate-900">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-stretch md:py-12">
        {/* LEFT SECTION */}
        <section className="flex w-full flex-col gap-4 md:w-2/5">
          {/* Lobby Header */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Lobby
            </p>

            <h1 className="mt-2 text-2xl font-bold leading-tight">
              The Startup: <span className="text-amber-500">Burnout</span>
            </h1>

            <p className="mt-2 text-xs text-slate-600 md:text-sm">
              Share your room code with teammates. Waiting for players to join.
            </p>
          </div>

          {/* Room Info */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
                  Room code
                </p>
                <p className="mt-1 font-mono text-xl tracking-wider text-slate-800">
                  {roomCode || "------"}
                </p>
              </div>

              <Button
                variant="basic"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100"
                onClick={copyLink}
              >
                <FaCopy className="h-3 w-3" />
                Copy lobby link
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
                  Host
                </p>
                <p className="mt-1 font-medium">{name || "You"}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-green-600 font-medium">In lobby</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <FaUsers className="h-3 w-3 text-sky-500" />
                Waiting for players…
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FaUserSecret className="h-3 w-3 text-rose-500" />1 spy • crew
                unknown
              </span>
            </div>
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-[0.7rem] uppercase tracking-widest text-slate-500">
                Host Controls
              </p>

              <Button
                onClick={startGame}
                className="mt-3"
                disabled={roomState ? roomState.players.length < 3 : true}
              >
                <FaPlay className="h-3 w-3" />
                Start Game
              </Button>

              <p className="mt-2 text-[0.7rem] text-slate-500">
                You’ll be able to start once enough players have joined.
              </p>
            </div>
          )}
        </section>

        {/* RIGHT SECTION */}
        <section className="flex w-full flex-1 flex-col gap-4">
          <PlayerListPanel
            players={roomState?.players ?? []}
            totalSlots={10}
            containerClassName="h-1/2"
            emptyMessage="Waiting for players…"
          />

          <ActivityLogPanel
            logs={roomState?.logs ?? []}
            containerClassName="h-1/2"
            emptyMessage="• Room created. Waiting for more players…"
          />
        </section>
      </div>
    </main>
  );
}
