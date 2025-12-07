import WebSocket from "ws";
import { rooms, wss } from "../index.js";
import { COLORS } from "./constants.js";

export function broadcastRoomState(
  room: IRoomState,
  payload: string = JSON.stringify({ type: "room-state", room })
) {
console.log(room)
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

  broadcastRoomState(room);
}
