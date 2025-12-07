import {
  FaUserSecret,
  FaTasks,
  FaDoorOpen,
  FaUserTie,
} from "react-icons/fa";
import { useWebSocketContext } from "../context/WebSocketContext";
import Button from "../components/Button";
import Error from "../components/Error";
import { useEffect, useMemo, useRef } from "react";
import { playerObj } from "../libs/utils";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import PlayerListPanel from "../components/PlayerListPanel";
import ActivityLogPanel from "../components/ActivityLogPanel";

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
    const userChoice = window.confirm(
      "Are you sure you want to leave the game?"
    );
    if (!userChoice) return;
    if (ws && roomCode !== "------") {
      ws.send(JSON.stringify({ type: "leave-room", roomCode }));
    }
    setRoomState(null);
    setGlobalError("");
    navigate(`/home`, { replace: true });
  }

  if (globalError) {
    return <Error globalError={globalError} />;
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
          <PlayerListPanel
            players={players}
            totalSlots={10}
            containerClassName="flex-1"
          />
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
          <ActivityLogPanel
            logs={logs}
            containerClassName="flex-1"
            emptyMessage="• Game events will appear here once the game starts."
          />
        </section>
      </div>
    </main>
  );
}
