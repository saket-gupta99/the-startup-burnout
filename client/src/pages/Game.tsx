import {
  FaUsers,
  FaUserSecret,
  FaTasks,
  FaDoorOpen,
  FaUserTie,
} from "react-icons/fa";
import { useWebSocketContext } from "../context/WebSocketContext";
import Button from "../components/Button";
import { useEffect, useMemo, useRef } from "react";
import { playerObj } from "../libs/utils";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

export default function Game() {
  const {
    roomState,
    ws,
    ready,
    mySocketId,
    globalError,
    setRoomState,
    setGlobalError,
    setRoomCode,
  } = useWebSocketContext();

  const players = useMemo(() => roomState?.players ?? [], [roomState?.players]);
  const taskProgress = roomState?.taskProgress ?? 0;
  const roomCode = roomState?.roomCode ?? "------";
  const logs = useMemo(() => roomState?.logs ?? [], [roomState?.logs]);
  const me = players.find((p) => p.socketId === mySocketId) ?? playerObj;
  const role = me.role ?? null;
  const navigate = useNavigate();
  const prevLogLenRef = useRef<number | null>(null); //this remembers how many messages were displayed last
  console.log("roomstate:", roomState);

  //using this effect to show latest logs in toast
  useEffect(() => {
    if (!logs.length) {
      prevLogLenRef.current = 0;
      return;
    }

    if (prevLogLenRef.current === null) {
      toast(logs[logs.length - 1]);
      prevLogLenRef.current = logs.length;
      return;
    }

    if (logs.length > prevLogLenRef.current) {
      const newLogs = logs.slice(prevLogLenRef.current);
      newLogs.forEach((log) => toast(log));
      prevLogLenRef.current = logs.length;
    }
  }, [logs, ws, ready]);

  //empty the room code and localstorage state if 1 player remains
  useEffect(() => {
    if (!roomState) return;

    const gameStarted =
      roomState.status === "in_progress" || roomState.status === "ended";
    if (gameStarted && players.length <= 1) {
      setRoomCode("");
      localStorage.removeItem("createdRoomCode");
    }
  }, [players, setRoomCode, roomState]);

  function completeATask() {
    if (!ws) return;
    ws.send(JSON.stringify({ type: "task-completed", roomCode }));
  }

  function leaveGame() {
    if (ws && roomCode !== "------") {
      ws.send(JSON.stringify({ type: "leave-room", roomCode }));
    }
    setRoomState(null);
    setGlobalError("");
    navigate(`/home`, { replace: true });
  }

  if (globalError) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-lg border border-red-300 bg-red-50 px-5 py-6 text-red-800">
          <h1 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-red-700">
              !
            </span>
            Connection Error
          </h1>

          <p className="text-sm mb-4">{globalError}</p>

          <Button variant="error" onClick={() => setGlobalError("")}>
            Dismiss & go back
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white text-slate-900">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-stretch md:py-12">
        {/* LEFT: Players */}
        <section className="flex w-full flex-col gap-4 md:w-1/3">
          {/* Game Header */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              In Game
            </p>

            <h1 className="mt-2 text-2xl font-bold leading-tight">
              The Startup: <span className="text-amber-500">Burnout</span>
            </h1>

            <p className="mt-2 text-xs text-slate-600 md:text-sm">
              Complete tasks to ship the product or sabotage the launch as the
              spy.
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
                  Room Code
                </p>
                <p className="mt-1 font-mono text-sm tracking-widest">
                  {roomCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-green-600 font-medium">
                  {roomState?.status === "in_progress"
                    ? "In Progress"
                    : roomState?.status === "ended"
                    ? "Ended"
                    : "Lobby"}
                </p>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUsers className="h-4 w-4 text-sky-500" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
                  Players
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] text-slate-500">
                {players.length} / 10
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs">
              {!players.length && (
                <p className="text-slate-500">Waiting for players…</p>
              )}

              {players.map((p) => (
                <div
                  key={p.socketId}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {/* Color circle from backend */}
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />

                    <span className="font-medium text-slate-700">{p.name}</span>

                    {p.isHost && (
                      <span className="text-[0.65rem] font-semibold text-amber-600">
                        (Host)
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[0.65rem] ${
                      p.isAlive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {p.isAlive ? "Alive" : "Dead"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MIDDLE: Role + Actions + Progress */}
        <section className="flex w-full flex-1 flex-col gap-4 md:w-1/3">
          {/* Your Role */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <p className="text-[0.7rem] uppercase tracking-widest text-slate-500">
              Your Role
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                {role === "spy" ? (
                  <FaUserSecret className="h-5 w-5 text-red-500" />
                ) : (
                  <FaUserTie className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 uppercase">
                  {role}
                </p>
                <p className="text-xs text-slate-500">
                  Crew: finish tasks. Spy: sabotage and eliminate others.
                </p>
              </div>
            </div>
          </div>

          {/* Task Progress */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTasks className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-800">
                  Product Launch Progress
                </p>
              </div>
              <span className="text-xs font-medium text-slate-600">
                {taskProgress}%
              </span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>

            <p className="mt-2 text-[0.7rem] text-slate-500">
              Complete tasks to reach 100% and successfully launch the product.
            </p>
          </div>

          {/* Actions (no logic yet) */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <p className="text-[0.7rem] uppercase tracking-widest text-slate-500">
              Actions
            </p>

            <div className="mt-3 space-y-2">
              {role === "crew" && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={completeATask}
                >
                  Do a task
                </Button>
              )}

              {role === "spy" && (
                <Button
                  variant="secondary"
                  className="w-full"
                  // onClick={() => {/* wire spy-kill later */}}
                >
                  Attempt sabotage
                </Button>
              )}

              <Button
                variant="basic"
                className="w-full flex items-center justify-center gap-2"
                // onClick={() => {/* wire meeting later */}}
              >
                Call emergency meeting
              </Button>
            </div>

            <Button
              variant="basic"
              className="w-full mt-2 inline-flex items-center gap-1"
              onClick={leaveGame}
            >
              <FaDoorOpen className="h-3 w-3" />
              Leave game
            </Button>
          </div>
        </section>

        {/* RIGHT: Activity Log */}
        <section className="flex w-full flex-1 flex-col gap-4 md:w-1/3">
          <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
                Activity Log
              </h2>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-700">
              {!logs.length ? (
                <p className="text-slate-500">
                  • Game events will appear here once the game starts.
                </p>
              ) : (
                logs.map((log, idx) => <p key={idx}>• {log}</p>)
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
