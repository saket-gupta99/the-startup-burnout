import { FaDoorOpen } from "react-icons/fa";
import Button from "../components/Button";
import SpyCooldowns from "./SpyCooldowns";

interface GameActionsProps {
  role: string | null;
  currentPlayerIsAlive: boolean;
  isFrozen: boolean;
  isSabotageDisabled: boolean;
  isKillDisabled: boolean;
  isFreezeDisabled: boolean;
  sabotageCooldown: number | null;
  killCooldown: number | null;
  freezeSecondsLeft: number | null;
  freezeCooldown: number | null;
  handleCrewTaskClick: () => void;
  handleSabotageAction: () => void;
  handleKillAction: () => void;
  handleFreezeAction: () => void;
  handleEmergencyMeetingAction: () => void;
  leaveGame: () => void;
}

export default function GameActions({
  role,
  currentPlayerIsAlive,
  isFrozen,
  isSabotageDisabled,
  isKillDisabled,
  isFreezeDisabled,
  sabotageCooldown,
  killCooldown,
  freezeSecondsLeft,
  freezeCooldown,
  handleCrewTaskClick,
  handleSabotageAction,
  handleKillAction,
  handleFreezeAction,
  handleEmergencyMeetingAction,
  leaveGame,
}: GameActionsProps) {
  return (
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
            disabled={!currentPlayerIsAlive || isFrozen}
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
          onClick={handleEmergencyMeetingAction}
          disabled={!currentPlayerIsAlive}
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
        <SpyCooldowns
          sabotageCooldown={sabotageCooldown}
          killCooldown={killCooldown}
          freezeSecondsLeft={freezeSecondsLeft}
          freezeCooldown={freezeCooldown}
        />
      )}
    </div>
  );
}