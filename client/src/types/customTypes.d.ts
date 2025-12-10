type Role = "crew" | "spy";

type PlayerColor =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "rose";

type Tasks =
  | "compile"
  | "data-entry"
  | "spam-filter"
  | "bug"
  | "captcha"
  | "terminal";

interface IPlayer {
  socketId: string;
  name: string;
  role: Role | null;
  isAlive: boolean;
  isHost: boolean;
  color?: PlayerColor;
}

interface IRoomState {
  roomCode: string;
  status: "lobby" | "in_progress" | "meeting" | "ended";
  players: IPlayer[];
  taskProgress: number;
  logs: string[];
}
