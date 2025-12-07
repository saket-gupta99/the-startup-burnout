export function cn(...args: (string | undefined | null | false | "")[]) {
  return args.filter(Boolean).join(" ");
}

export const playerObj:IPlayer = {
  socketId: "",
  role: null,
  name: "",
  isAlive: false,
  isHost:false
} 