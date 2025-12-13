import {
  FREEZE_COOLDOWN,
  FREEZE_DURATION,
  KILL_COOLDOWN,
  SABOTAGE_COOLDOWN,
} from "../libs/utils";
import CooldownIndicator from "./CooldownIndicator";

interface SpyCooldownsProps {
  sabotageCooldown: number | null;
  killCooldown: number | null;
  freezeSecondsLeft: number | null;
  freezeCooldown: number | null;
}

export default function SpyCooldowns({
  sabotageCooldown,
  killCooldown,
  freezeSecondsLeft,
  freezeCooldown,
}: SpyCooldownsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
      {sabotageCooldown !== null && (
        <CooldownIndicator
          label="Sabotage"
          sublabel="Cooldown"
          seconds={sabotageCooldown}
          maxSeconds={Math.ceil(SABOTAGE_COOLDOWN / 1000)}
          barColor="bg-amber-400"
        />
      )}

      {killCooldown !== null && (
        <CooldownIndicator
          label="Kill"
          sublabel="Cooldown"
          seconds={killCooldown}
          maxSeconds={Math.ceil(KILL_COOLDOWN / 1000)}
          barColor="bg-rose-500"
        />
      )}

      {freezeSecondsLeft !== null && (
        <CooldownIndicator
          label="Freeze (active)"
          sublabel="Crew frozen"
          seconds={freezeSecondsLeft}
          maxSeconds={Math.ceil(FREEZE_DURATION / 1000)}
          barColor="bg-sky-500"
        />
      )}

      {freezeCooldown !== null && (
        <CooldownIndicator
          label="Freeze (cooldown)"
          sublabel="Available again in"
          seconds={freezeCooldown}
          maxSeconds={Math.ceil(FREEZE_COOLDOWN / 1000)}
          barColor="bg-sky-400"
        />
      )}
    </div>
  );
}