import { useWebSocketContext } from "../context/WebSocketContext";
import Error from "../components/Error";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  crewTasksToDo,
  FREEZE_COOLDOWN,
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
import RoleCard from "../components/RoleCard";
import TaskProgress from "../components/TaskProgress";
import FreezeOverlay from "../components/FreezeOverlay";
import GameActions from "../components/GameActions";

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
        <FreezeOverlay freezeSecondsLeft={freezeSecondsLeft} />
      )}

      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-stretch md:py-12">
        {/* LEFT: Players */}
        <section className="flex w-full flex-col gap-4 md:w-1/3">
          <GameHeader roomCode={roomCode} status={roomState?.status} />

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
          <RoleCard role={role} />

          <TaskProgress taskProgress={taskProgress} />

          {/* Actions */}
          <GameActions
            role={role}
            currentPlayerIsAlive={currentPlayer?.isAlive ?? false}
            isFrozen={isFrozen}
            isSabotageDisabled={isSabotageDisabled}
            isKillDisabled={isKillDisabled}
            isFreezeDisabled={isFreezeDisabled}
            sabotageCooldown={sabotageCooldown}
            killCooldown={killCooldown}
            freezeSecondsLeft={freezeSecondsLeft}
            freezeCooldown={freezeCooldown}
            handleCrewTaskClick={handleCrewTaskClick}
            handleSabotageAction={handleSabotageAction}
            handleKillAction={handleKillAction}
            handleFreezeAction={handleFreezeAction}
            leaveGame={leaveGame}
          />
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

      {/* Modals */}
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
