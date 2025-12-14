import WebSocket from "ws";
import { rooms, wss } from "../index.js";
import { COLORS, DISCUSSION_TIME, VOTING_TIME } from "./constants.js";

export function broadcastRoomState(
  room: IRoomState,
  payload: string = JSON.stringify({ type: "room-state", room })
) {
  console.log(room);
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      room.players.some((p) => p.socketId === client.id)
    ) {
      client.send(payload);
    }
  });
}

export function getRoom(roomCode: string, ws: WebSocket) {
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "No room exists with this code!",
      })
    );
    return;
  }

  return room;
}

export function assignColor(room: IRoomState): PlayerColor {
  const used = new Set(room.players.map((p) => p.color));
  const free = COLORS.find((c) => !used.has(c));
  return free! ?? COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function leavingPlayerSync(
  room: IRoomState,
  ws: WebSocket,
  roomCode: string
) {
  const idx = room.players.findIndex((p) => p.socketId === ws.id);

  if (idx === -1) return;

  const [leavingPlayer] = room.players.splice(idx, 1);
  console.log(`${leavingPlayer?.name} left the room!`);
  room.logs.push(`${leavingPlayer?.name} left the room!`);

  //if room is empty -> delete it
  if (room.players.length === 0) {
    rooms.delete(roomCode);
    return;
  }

  //if host left, make someone else host
  if (leavingPlayer?.isHost) {
    const firstPlayer = room.players[0];
    firstPlayer!.isHost = true;
    room.logs.push(`${firstPlayer!.name} is now the host`);
  }

  // there's only 1 spy so for now do this
  if (leavingPlayer?.role === "spy") {
    room.status = "ended";
    room.logs.push("Spy left the game. Crew wins!");
  }

  broadcastRoomState(room);
}

export function startMeeting(room: IRoomState, reason: string) {
  if (room.meeting.hasMeeting && room.status === "meeting") return;

  room.status = "meeting";
  room.meeting.hasMeeting = true;
  room.meeting.votes = {};
  room.chats = [];
  room.chats.push({ name: "System", msg: reason });

  room.meeting.discussionEndsAt = Date.now() + DISCUSSION_TIME;
  room.meeting.votingEndsAt = null;

  room.logs.push(`Meeting started: ${reason}`);
  broadcastRoomState(room);

  // Start voting after discussion time
  setTimeout(() => {
    startVotingPhase(room);
  }, DISCUSSION_TIME);
}

export function startVotingPhase(room: IRoomState) {
  if (room.status !== "meeting") return;

  room.meeting.votingEndsAt = Date.now() + VOTING_TIME;
  room.logs.push("Voting has started.");
  broadcastRoomState(room);

  // When voting time ends, evaluate results
  setTimeout(() => {
    finishVoting(room);
  }, VOTING_TIME);
}

export function finishVoting(room: IRoomState) {
  if (room.status !== "meeting") return;

  const votes = Object.values(room.meeting.votes);

  // If no votes → no one ejected
  if (votes.length === 0) {
    room.logs.push("No votes cast. No one was ejected.");
    endMeeting(room);
    return;
  }

  // Count votes
  const tally: Record<string, number> = {};
  for (const choice of votes) {
    tally[choice] = (tally[choice] || 0) + 1;
  }

  // Determine highest vote getters
  const maxVotes = Math.max(...Object.values(tally));
  const candidates = Object.keys(tally).filter((x) => tally[x] === maxVotes);

  // Tie → no ejection
  if (candidates.length > 1 || candidates[0] === "skip") {
    room.logs.push("Voting tied. No one was ejected.");
    endMeeting(room);
    return;
  }

  // Otherwise, eject the player with most votes
  const suspectId = candidates[0];
  const suspect = room.players.find((p) => p.socketId === suspectId);

  if (!suspect) {
    room.logs.push("Invalid suspect during voting. No one ejected.");
    endMeeting(room);
    return;
  }

  suspect.isAlive = false;

  if (suspect.role === "spy") {
    room.logs.push(`${suspect.name} was the spy! Crew wins!`);
    room.status = "ended";
    broadcastRoomState(room);
    return;
  } else {
    room.logs.push(`${suspect.name} was not the spy. They were ejected.`);
  }

  endMeeting(room);
}

export function endMeeting(room: IRoomState) {
  room.meeting.hasMeeting = false;
  room.meeting.votes = {};
  room.meeting.discussionEndsAt = null;
  room.meeting.votingEndsAt = null;

  if (room.status === "meeting") room.status = "in_progress";

  room.logs.push("Meeting ended. Back to work.");
  broadcastRoomState(room);
}
