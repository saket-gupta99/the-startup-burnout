export function cn(...args: (string | undefined | null | false | "")[]) {
  return args.filter(Boolean).join(" ");
}

export const playerObj: IPlayer = {
  socketId: "",
  role: null,
  name: "",
  isAlive: false,
  isHost: false,
};

export function formatTitle(type: string) {
  return type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const crewTasksToDo: Tasks[] = [
  "bug",
  "captcha",
  "compile",
  "data-entry",
  "spam-filter",
  "terminal",
  "api-status",
  "log-sequence"
];

//shuffle array items
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRemainingSecondsFromTimestamp(
  sinceTsOrUntilTs: number | null | undefined,
  durationMs: number,
  type: "since" | "until"
) {
  if (!sinceTsOrUntilTs) return 0;
  const now = Date.now();
  if (type === "since") {
    // sinceAt + durationMs is when cooldown ends
    const end = sinceTsOrUntilTs + durationMs;
    const remMs = end - now;
    return remMs > 0 ? Math.ceil(remMs / 1000) : 0;
  } else {
    // until timestamp directly is expiration
    const remMs = sinceTsOrUntilTs - now;
    return remMs > 0 ? Math.ceil(remMs / 1000) : 0;
  }
}

export function playSound(path: string, volume = 0.5) {
  const audio = new Audio(path);
  audio.volume = volume;
  audio.play().catch(() => {});
}

//cooldown for spy actions
export const KILL_COOLDOWN = 30000;
export const SABOTAGE_COOLDOWN = 30000;
export const FREEZE_COOLDOWN = 60000;
export const FREEZE_DURATION = 5000;
