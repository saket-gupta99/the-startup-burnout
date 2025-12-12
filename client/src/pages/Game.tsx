import { FaUserSecret, FaTasks, FaDoorOpen, FaUserTie } from "react-icons/fa";
import { useWebSocketContext } from "../context/WebSocketContext";
import Button from "../components/Button";
import Error from "../components/Error";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  crewTasksToDo,
  FREEZE_COOLDOWN,
  FREEZE_DURATION,
  getRemainingSecondsFromTimestamp,
  KILL_COOLDOWN,
  playerObj,
  SABOTAGE_COOLDOWN,
} from "../libs/utils";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import PlayerListPanel from "../components/PlayerListPanel";
import ActivityLogPanel from "../components/ActivityLogPanel";
import GameOverModal from "../components/GameOverModal";
import TaskModal from "../components/TaskModal";
import GameHeader from "../components/GameHeader";

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

  const [attemptingToKill, setAttemptingToKill] = useState(false);
  const [hasDismissedResults, setHasDismissedResults] = useState(false);
  const [activeTask, setActiveTask] = useState<null | Tasks>(null);
  const [sabotageCooldown, setSabotageCooldown] = useState<null | number>(null);
  const [killCooldown, setKillCooldown] = useState<null | number>(null);
  const [freezeSecondsLeft, setFreezeSecondsLeft] = useState<null | number>(
    null
  );
  const [freezeCooldown, setFreezeCooldown] = useState<number | null>(null);
  // Refs to keep interval ids so we can clear them
  const sabotageTimerRef = useRef<number | null>(null);
  const killTimerRef = useRef<number | null>(null);
  const freezeTimerRef = useRef<number | null>(null);
  const freezeCooldownTimerRef = useRef<number | null>(null);

  const players = useMemo(() => roomState?.players ?? [], [roomState?.players]);
  const taskProgress = roomState?.taskProgress ?? 0;
  const roomCode = roomState?.roomCode ?? "------";
  const logs = useMemo(() => roomState?.logs ?? [], [roomState?.logs]);
  const me = players.find((p) => p.socketId === mySocketId) ?? playerObj;
  const role = me.role ?? null;
  const navigate = useNavigate();
  //this remembers how many messages were displayed last
  const prevLogLenRef = useRef<number | null>(null);
  const isGameEnded = roomState?.status === "ended";
  const lastLog = logs.length ? logs[logs.length - 1] : "";
  const shouldShowModal = isGameEnded && !hasDismissedResults;
  const currentPlayer = players.find((p) => p.socketId === mySocketId);

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

  //Derive cooldown remaining from server timestamps
  //Sync cooldowns when server roomState changes
  useEffect(() => {
    if (!roomState) return;

    //sabotage
    const remSab = getRemainingSecondsFromTimestamp(
      roomState.lastSabotageAt,
      SABOTAGE_COOLDOWN,
      "since"
    );
    const newSabotageCooldown = remSab > 0 ? remSab : null;

    //kill
    const mePlayer =
      roomState.players.find((p) => p.socketId === mySocketId) ?? null;
    const myLastKillAt = mePlayer?.lastKillAt ?? null;
    const remKill = getRemainingSecondsFromTimestamp(
      myLastKillAt,
      KILL_COOLDOWN,
      "since"
    );
    const newKillCooldown = remKill > 0 ? remKill : null;

    const remFreezeActive = getRemainingSecondsFromTimestamp(
      roomState.freezeUntil,
      FREEZE_COOLDOWN,
      "until"
    );
    const newFreezeSecondsLeft = remFreezeActive > 0 ? remFreezeActive : null;

    // Freeze cooldown (time until you can use freeze again)
    const remFreezeCooldown = getRemainingSecondsFromTimestamp(
      roomState.lastFreezeAt,
      FREEZE_COOLDOWN,
      "since"
    );
    const newFreezeCooldown = remFreezeCooldown > 0 ? remFreezeCooldown : null;

    setSabotageCooldown((cur) =>
      cur === newSabotageCooldown ? cur : newSabotageCooldown
    );
    setKillCooldown((cur) => (cur === newKillCooldown ? cur : newKillCooldown));
    setFreezeSecondsLeft((cur) =>
      cur === newFreezeSecondsLeft ? cur : newFreezeSecondsLeft
    );
    setFreezeCooldown((cur) =>
      cur === newFreezeCooldown ? cur : newFreezeCooldown
    );
  }, [roomState, mySocketId]);

  //manage sabotage cooldown
  useEffect(() => {
    if (sabotageTimerRef.current) {
      window.clearInterval(sabotageTimerRef.current);
      sabotageTimerRef.current = null;
    }
    if (sabotageCooldown && sabotageCooldown > 0) {
      sabotageTimerRef.current = window.setInterval(() => {
        setSabotageCooldown((prev) => {
          if (!prev) {
            window.clearInterval(sabotageTimerRef.current!);
            sabotageTimerRef.current = null;
            return null;
          }
          if (prev <= 1) {
            window.clearInterval(sabotageTimerRef.current!);
            sabotageTimerRef.current = null;
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (sabotageTimerRef.current) {
        window.clearInterval(sabotageTimerRef.current);
        sabotageTimerRef.current = null;
      }
    };
  }, [sabotageCooldown]);

  //manage kill cooldown
  useEffect(() => {
    if (killTimerRef.current) {
      window.clearInterval(killTimerRef.current);
      killTimerRef.current = null;
    }
    if (killCooldown && killCooldown > 0) {
      killTimerRef.current = window.setInterval(() => {
        setKillCooldown((prev) => {
          if (!prev) {
            window.clearInterval(killTimerRef.current!);
            killTimerRef.current = null;
            return null;
          }
          if (prev <= 1) {
            window.clearInterval(killTimerRef.current!);
            killTimerRef.current = null;
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (killTimerRef.current) {
        window.clearInterval(killTimerRef.current);
        killTimerRef.current = null;
      }
    };
  }, [killCooldown]);

  //manage freeze active timer
  useEffect(() => {
    if (freezeTimerRef.current) {
      window.clearInterval(freezeTimerRef.current);
      freezeTimerRef.current = null;
    }

    if (freezeSecondsLeft && freezeSecondsLeft > 0) {
      freezeTimerRef.current = window.setInterval(() => {
        setFreezeSecondsLeft((prev) => {
          if (!prev || prev <= 1) {
            if (freezeTimerRef.current) {
              window.clearInterval(freezeTimerRef.current);
              freezeTimerRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (freezeTimerRef.current) {
        window.clearInterval(freezeTimerRef.current);
        freezeTimerRef.current = null;
      }
    };
  }, [freezeSecondsLeft]);

  //manage freeze cooldown timer
  useEffect(() => {
    if (freezeCooldownTimerRef.current) {
      window.clearInterval(freezeCooldownTimerRef.current);
      freezeCooldownTimerRef.current = null;
    }

    if (freezeCooldown && freezeCooldown > 0) {
      freezeCooldownTimerRef.current = window.setInterval(() => {
        setFreezeCooldown((prev) => {
          if (!prev || prev <= 1) {
            if (freezeCooldownTimerRef.current) {
              window.clearInterval(freezeCooldownTimerRef.current);
              freezeCooldownTimerRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (freezeCooldownTimerRef.current) {
        window.clearInterval(freezeCooldownTimerRef.current);
        freezeCooldownTimerRef.current = null;
      }
    };
  }, [freezeCooldown]);

  function leaveGame() {
    const userChoice = window.confirm(
      "Are you sure you want to leave the game?"
    );
    if (!userChoice) return;
    if (ws && roomCode !== "------") {
      ws.send(JSON.stringify({ type: "leave-room", roomCode }));
    }
    setRoomState(null);
    setRoomCode("");
    setGlobalError("");
    navigate(`/home`, { replace: true });
  }

  function handleSabotageAction() {
    if (role !== "spy" || !ws) return;
    ws.send(JSON.stringify({ type: "sabotage", roomCode }));
    setSabotageCooldown(Math.ceil(SABOTAGE_COOLDOWN / 1000));
  }

  function handleKillAction() {
    setAttemptingToKill((s) => !s);
  }

  function killPlayer(targetId: string) {
    if (role !== "spy" || !ws) return;
    ws.send(
      JSON.stringify({
        type: "spy-kill",
        roomCode: roomCode,
        targetSocketId: targetId,
      })
    );
    setKillCooldown(Math.ceil(KILL_COOLDOWN / 1000));
    setAttemptingToKill(false);
  }

  function handleFreezeAction() {
    if (role !== "spy" || !ws) return;
    ws.send(JSON.stringify({ type: "ddos", roomCode }));
    setFreezeSecondsLeft(Math.ceil(FREEZE_COOLDOWN / 1000));
  }

  function handlePlayAgain() {
    setRoomState(null);
    setGlobalError("");
    setRoomCode("");
    navigate("/home", { replace: true });
  }

  //randomly assign different tasks to players
  function handleCrewTaskClick() {
    if (role !== "crew") return;

    const task =
      crewTasksToDo[Math.floor(Math.random() * crewTasksToDo.length)];
    setActiveTask(task);
  }

  //on crew task complete
  function onTaskComplete() {
    if (!ws || !roomCode) return;
    ws.send(JSON.stringify({ type: "task-completed", roomCode }));
    setActiveTask(null);
  }

  function handleStayOnResults() {
    setGlobalError("");
    setHasDismissedResults(true);
  }

  if (globalError) {
    return <Error globalError={globalError} />;
  }

  // Calculate if buttons should be disabled
  const isSabotageDisabled = sabotageCooldown !== null && sabotageCooldown > 0;
  const isKillDisabled = killCooldown !== null && killCooldown > 0;
  const isFreezeDisabled = freezeCooldown !== null && freezeCooldown > 0;
  const isFrozen = freezeSecondsLeft !== null && freezeSecondsLeft > 0;

  return (
    <main className="min-h-dvh bg-white text-slate-900">
      {freezeSecondsLeft && freezeSecondsLeft > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="rounded-md bg-white px-6 py-4 shadow">
            <p className="text-sm">
              System frozen — reconnecting in {freezeSecondsLeft}s
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-stretch md:py-12">
        {/* LEFT: Players */}
        <section className="flex w-full flex-col gap-4 md:w-1/3">
          <GameHeader
            roomCode={roomCode}
            status={roomState?.status}
          />

          <PlayerListPanel
            players={players}
            totalSlots={10}
            containerClassName="flex-1"
            attemptingToKill={attemptingToKill}
            killPlayer={killPlayer}
            mySocketId={mySocketId}
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

          {/* Actions */}
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
            <p className="text-[0.7rem] uppercase tracking-widest text-slate-500">
              Actions
            </p>

            <div className="mt-3 space-y-2">
              {role === "crew" && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCrewTaskClick}
                  disabled={!currentPlayer?.isAlive || isFrozen}
                >
                  Do a task
                </Button>
              )}

              {role === "spy" && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleSabotageAction}
                  disabled={isSabotageDisabled}
                >
                  Attempt Sabotage
                </Button>
              )}

              {role === "spy" && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleKillAction}
                  disabled={isKillDisabled}
                >
                  Attempt Kill
                </Button>
              )}

              {role === "spy" && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleFreezeAction}
                  disabled={isFreezeDisabled}
                >
                  Attempt DDOS
                </Button>
              )}

              <Button
                variant="basic"
                className="w-full flex items-center justify-center gap-2"
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

            {/* Spy cooldown UI */}
            {role === "spy" && (
              <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
                {sabotageCooldown !== null && (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-700">
                          Sabotage
                        </div>
                        <div className="text-[0.7rem] text-slate-500">
                          Cooldown
                        </div>
                      </div>
                      <div className="text-sm font-mono text-slate-700">
                        {sabotageCooldown}s
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width: `${Math.max(
                            0,
                            (sabotageCooldown /
                              Math.ceil(SABOTAGE_COOLDOWN / 1000)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {killCooldown !== null && (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-700">Kill</div>
                        <div className="text-[0.7rem] text-slate-500">
                          Cooldown
                        </div>
                      </div>
                      <div className="text-sm font-mono text-slate-700">
                        {killCooldown}s
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{
                          width: `${Math.max(
                            0,
                            (killCooldown / Math.ceil(KILL_COOLDOWN / 1000)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {freezeSecondsLeft !== null && (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-700">
                          Freeze (active)
                        </div>
                        <div className="text-[0.7rem] text-slate-500">
                          Crew frozen
                        </div>
                      </div>
                      <div className="text-sm font-mono text-slate-700">
                        {freezeSecondsLeft}s
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{
                          width: `${Math.max(
                            0,
                            (freezeSecondsLeft /
                              Math.ceil(FREEZE_DURATION / 1000)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {freezeCooldown !== null && (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-700">
                          Freeze (cooldown)
                        </div>
                        <div className="text-[0.7rem] text-slate-500">
                          Available again in
                        </div>
                      </div>
                      <div className="text-sm font-mono text-slate-700">
                        {freezeCooldown}s
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-400"
                        style={{
                          width: `${Math.max(
                            0,
                            (freezeCooldown /
                              Math.ceil(FREEZE_COOLDOWN / 1000)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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

      {shouldShowModal && (
        <GameOverModal
          outcome={lastLog || "The game has ended"}
          onPlayAgain={handlePlayAgain}
          onStay={handleStayOnResults}
        />
      )}

      {activeTask && (
        <TaskModal
          isOpen={activeTask !== null}
          onTaskComplete={onTaskComplete}
          onClose={() => setActiveTask(null)}
          taskType={activeTask}
        />
      )}
    </main>
  );
}
