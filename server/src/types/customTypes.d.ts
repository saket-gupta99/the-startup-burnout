type Role = "crew" | "spy";

type PlayerColor =
  | "red"
  | "orange"
  | "gold"
  | "yellow"
  | "lime"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "deeppink";

interface IPlayer {
  socketId: string;
  name: string;
  role: Role | null;
  isAlive: boolean;
  isHost: boolean;
  color?: PlayerColor;
  lastKillAt?: number;
}

interface Chat {
  name: string;
  msg: string;
}

interface Meeting {
  discussionEndsAt: null | number; // timestamp
  votingEndsAt: null | number; // timestamp
  votes: Record<string, string | "skip">; // socketId → suspectId | "skip"
  hasMeeting: boolean; // helper so multiple meetings can't overlap
}
interface IRoomState {
  roomCode: string;
  status: "lobby" | "in_progress" | "meeting" | "ended";
  players: IPlayer[];
  taskProgress: number;
  logs: string[];
  chats?: Chat[];
  lastSabotageAt?: number | null;
  freezeUntil?: number | null;
  lastFreezeAt?: number | null;
  meeting: Meeting;
}
