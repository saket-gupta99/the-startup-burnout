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
