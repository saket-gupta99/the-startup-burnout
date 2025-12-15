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
  const tally: Record<string, number> = {};

  for (const choice of votes) {
    tally[choice] = (tally[choice] || 0) + 1;
  }

  let ejectedPlayer: string | null = null;
  let isSpy = false;
  let reason = "";

  // No votes casted
  if (votes.length === 0) {
    reason = "No votes cast. No one was ejected.";

    broadcastVotingResults(room, {
      tally,
      ejectedPlayer,
      isSpy,
      reason,
    });

    setTimeout(() => endMeeting(room), 2500);
    return;
  }

  const maxVotes = Math.max(...Object.values(tally));
  const candidates = Object.keys(tally).filter(
    (id) => tally[id] === maxVotes
  );

  // Tie or skip
  if (candidates.length > 1 || candidates[0] === "skip") {
    reason = "Voting tied. No one was ejected.";

    broadcastVotingResults(room, {
      tally,
      ejectedPlayer,
      isSpy,
      reason,
    });

    setTimeout(() => endMeeting(room), 2500);
    return;
  }

  // Eject player
  const suspectId = candidates[0];
  const suspect = room.players.find((p) => p.socketId === suspectId);

  if (!suspect) {
    reason = "Invalid suspect. No one was ejected.";

    broadcastVotingResults(room, {
      tally,
      ejectedPlayer,
      isSpy,
      reason,
    });

    setTimeout(() => endMeeting(room), 2500);
    return;
  }

  suspect.isAlive = false;
  ejectedPlayer = suspect.socketId;
  isSpy = suspect.role === "spy";

  reason = isSpy
    ? `${suspect.name} was the spy!`
    : `${suspect.name} was not the spy.`;

  broadcastVotingResults(room, {
    tally,
    ejectedPlayer,
    isSpy,
    reason,
  });

  // End game if spy eliminated
  if (isSpy) {
    room.logs.push(reason);
    room.status = "ended";
    broadcastRoomState(room);
    return;
  }

  // Delay endMeeting so FE can animate
  setTimeout(() => {
    endMeeting(room);
  }, 2500);
}


export function endMeeting(room: IRoomState) {
  room.meeting.hasMeeting = false;
  room.meeting.votes = {};
  room.meeting.discussionEndsAt = null;
  room.meeting.votingEndsAt = null;

  //check spy win condition
  const aliveSpies = room.players.filter(
    (p) => p.isAlive && p.role === "spy"
  ).length;
  const aliveCrew = room.players.filter(
    (p) => p.isAlive && p.role === "crew"
  ).length;

  if (aliveSpies >= aliveCrew) {
    room.status = "ended";
    room.logs.push("Spy wins! Launch failed");
  } else if (room.status === "meeting") {
    room.status = "in_progress";
    room.logs.push("Meeting ended. Back to work.");
  }
  broadcastRoomState(room);
}


export function broadcastVotingResults(
  room: IRoomState,
  results: {
    tally: Record<string, number>;
    ejectedPlayer: string | null;
    isSpy: boolean;
    reason: string;
  }
) {
  const payload = JSON.stringify({
    type: "voting-results",
    results,
  });

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      room.players.some((p) => p.socketId === client.id)
    ) {
      client.send(payload);
    }
  });
}
