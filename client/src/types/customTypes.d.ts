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
  | "terminal"
  | "api-status"
  | "log-sequence";

interface IPlayer {
  socketId: string;
  name: string;
  role: Role | null;
  isAlive: boolean;
  isHost: boolean;
  color?: PlayerColor;
  lastKillAt?: number;
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
  lastSabotageAt?: number;
  freezeUntil?: number;
  lastFreezeAt?: number;
  meeting: Meeting;
}

interface VotingResult {
  tally: Record<string, number>;
  ejectedPlayer: string | null;
  isSpy: boolean;
  reason: string;
}
