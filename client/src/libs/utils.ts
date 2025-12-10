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
