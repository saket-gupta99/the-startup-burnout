import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { randomBytes, randomUUID } from "crypto";
import {
  assignColor,
  broadcastRoomState,
  getRoom,
  leavingPlayerSync,
  startMeeting,
} from "./utils/libs.js";
import {
  COLORS,
  FREEZE_COOLDOWN,
  FREEZE_DURATION,
  KILL_COOLDOWN,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SABOTAGE_COOLDOWN,
} from "./utils/constants.js";

dotenv.config({ path: "./.env" });

const app = express();
const server = http.createServer(app);
export const wss = new WebSocketServer({ server });

export const rooms = new Map<string, IRoomState>();

wss.on("connection", (ws: WebSocket) => {
  const id = randomUUID();
  ws.id = id;
  ws.send(JSON.stringify({ type: "welcome", socketId: id }));

  console.log("-----------------------\nnew connection added with id", id);

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (error) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    switch (msg.type) {
      /* generate roomCode */
      case "generate-roomCode": {
        const roomCode = randomBytes(3).toString("hex").toUpperCase();
        ws.send(JSON.stringify({ type: "roomCode-generated", roomCode }));
        console.log(`Generated room code: ${roomCode}`);
        break;
      }

      /* create room */
      //only host should trigger
      case "create-room": {
        console.log("Firing create room");
        const roomCode = msg.roomCode;
        if (!roomCode || !msg.name) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Provide room code and name of player",
            })
          );
          return;
        }
        if (rooms.get(roomCode)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Room with this code already exists!",
            })
          );
          return;
        }

        const room: IRoomState = {
          roomCode: roomCode,
          status: "lobby",
          players: [
            {
              socketId: ws.id,
              name: msg.name,
              role: null,
              isAlive: true,
              isHost: true,
              color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
            },
          ],
          taskProgress: 0,
          logs: [`Room ${roomCode} created by ${msg.name}`],
          meeting: {
            discussionEndsAt: null,
            votingEndsAt: null,
            votes: {},
            hasMeeting: false,
          },
        };

        rooms.set(roomCode, room);
        broadcastRoomState(room);
        break;
      }

      /* join room */
      //only non-host should trigger
      case "join-room": {
        console.log("Firing join room");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;

        if (room.status !== "lobby") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "The game has already started or ended!",
            })
          );
          return;
        }

        if (room.players.length >= MAX_PLAYERS) {
          ws.send(
            JSON.stringify({
              type: "error",
              message:
                "The room size exceeded. can't hold more than 10 players",
            })
          );
          return;
        }

        const playerAlreadyInRoom = room.players.find(
          (p) => p.socketId === ws.id
        );

        if (playerAlreadyInRoom) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "You are already in the room!",
            })
          );
          return;
        }

        const player: IPlayer = {
          socketId: ws.id,
          name: msg.name,
          role: null,
          isAlive: true,
          isHost: false,
          color: assignColor(room),
        };

        room.players.push(player);
        room.logs.push(`${msg.name} joined the room`);

        broadcastRoomState(room);
        break;
      }

      /* leave room */
      case "leave-room": {
        console.log("Firing leave room");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;

        leavingPlayerSync(room, ws, msg.roomCode);
        break;
      }

      /* start game */
      case "start-game": {
        console.log("Firing start game");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;

        if (room.players.length < MIN_PLAYERS) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `There should be atleast ${MIN_PLAYERS} players.`,
            })
          );
          return;
        }

        const host = room.players.find((p) => p.socketId === ws.id);

        if (!host || !host.isHost) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Only host can start the game!",
            })
          );
          return;
        }

        if (room.status !== "lobby") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Game has already started or ended.",
            })
          );
          return;
        }

        room.status = "in_progress";

        //pick imposter
        const imposterId = Math.floor(Math.random() * room.players.length);
        room.players.forEach((p, idx) => {
          p.role = idx === imposterId ? "spy" : "crew";
          p.isAlive = true;
        });

        room.taskProgress = 0;
        room.logs.push("Game Started");

        broadcastRoomState(room);
        break;
      }

      /* task completed */
      case "task-completed": {
        console.log("Firing task completed");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;

        if (room.status !== "in_progress") return;

        const player = room.players.find((p) => p.socketId === ws.id);
        if (!player || !player.isAlive) {
          ws.send(
            JSON.stringify({ type: "error", message: "You can't do tasks" })
          );
          return;
        }
        //dont allow spies to do task
        if (player.role !== "crew") {
          ws.send(
            JSON.stringify({ type: "error", message: "Spies can't do tasks" })
          );
          return;
        }

        //dont allow task to be completed when under ddos attack
        const now = Date.now();
        if (room.freezeUntil && now < FREEZE_COOLDOWN) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Cant do task while under attack",
            })
          );
          return;
        }

        room.taskProgress = Math.min(100, room.taskProgress + 10);
        room.logs.push(`A task was completed by ${msg.name}`);

        if (room.taskProgress >= 100) {
          room.status = "ended";
          room.logs.push("Crew wins! Product launched");
        }

        broadcastRoomState(room);
        break;
      }

      /* spy kill */
      case "spy-kill": {
        console.log("Firing spy kill");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;
        const targetSocketId = msg.targetSocketId;

        if (room.status !== "in_progress") {
          ws.send(
            JSON.stringify({ type: "error", message: "Game not in progress" })
          );
          return;
        }
        if (targetSocketId === ws.id) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "You can't kill yourself",
            })
          );
          return;
        }

        const killer = room.players.find((p) => p.socketId === ws.id);
        if (!killer || killer.role !== "spy" || !killer.isAlive) {
          ws.send(JSON.stringify({ type: "error", message: "Not allowed" }));
          return;
        }

        const target = room.players.find((p) => p.socketId === targetSocketId);
        if (!target || !target.isAlive) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid target" }));
          return;
        }

        //cooldown check
        const now = Date.now();
        if (killer.lastKillAt && now - killer.lastKillAt < KILL_COOLDOWN) {
          ws.send(
            JSON.stringify({ type: "error", message: "kill on cooldown" })
          );
          return;
        }
        killer.lastKillAt = now;

        target.isAlive = false;
        room.logs.push(`Connection lost for ${target.name}`);

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
        }

        broadcastRoomState(room!);

        // Start meeting automatically
        if (room.status !== "ended") {
          room.meeting.hasMeeting = true;
          setTimeout(() => {
            startMeeting(room, `${target.name}'s body was reported`);
          }, 2000);
        }
        break;
      }

      /* Sabotage */
      case "sabotage": {
        console.log("Firing spy sabotage");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;
        if (room.status !== "in_progress") {
          ws.send(
            JSON.stringify({ type: "error", message: "Game not in progress" })
          );
          return;
        }

        const spy = room.players.find((p) => p.socketId === ws.id);
        if (!spy || spy.role !== "spy" || !spy.isAlive) {
          ws.send(JSON.stringify({ type: "error", message: "Not allowed" }));
          return;
        }

        //check if on cooldown
        const now = Date.now();
        if (
          room.lastSabotageAt &&
          now - room.lastSabotageAt < SABOTAGE_COOLDOWN
        ) {
          ws.send(
            JSON.stringify({ type: "error", message: "Sabotage on cooldown" })
          );
          return;
        }
        room.lastSabotageAt = now;
        room.taskProgress = Math.max(0, (room.taskProgress || 0) - 10);
        room.logs.push("Sabotage happended. Global Progress reduced by 10%");

        broadcastRoomState(room);
        break;
      }

      /* DDOS */
      case "ddos": {
        console.log("Firing ddos");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;
        if (room.status !== "in_progress") {
          ws.send(
            JSON.stringify({ type: "error", message: "Game not in progress" })
          );
          return;
        }

        const spy = room.players.find((p) => p.socketId === ws.id);
        if (!spy || spy.role !== "spy" || !spy.isAlive) {
          ws.send(JSON.stringify({ type: "error", message: "Not allowed" }));
          return;
        }

        //check if on cooldown
        const now = Date.now();
        if (room.lastFreezeAt && now - room.lastFreezeAt < FREEZE_COOLDOWN) {
          ws.send(
            JSON.stringify({ type: "error", message: "Freeze on cooldown" })
          );
          return;
        }
        room.lastFreezeAt = now;
        room.freezeUntil = room.lastFreezeAt + FREEZE_DURATION;
        room.logs.push("System under DDOS attack. Screen Frozen for 5s.");
        broadcastRoomState(room);
        break;
      }

      /* Start meeting */
      case "start-meeting": {
        console.log("Firing start meeting");
        const room = getRoom(msg.roomCode, ws);
        if (!room) return;

        if (room.status === "meeting") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Meeting already in progress",
            })
          );
          return;
        }
        if (room.status !== "in_progress") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Can start meeting only in game",
            })
          );
          return;
        }

        const player = room.players.find((p) => p.socketId === ws.id);
        if (!player || !player.isAlive) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Only alive player can start the meeting",
            })
          );
          return;
        }
        room.chats = [];
        room.chats.push({
          name: "System",
          msg: `${player.name} started the meeting`,
        });

        startMeeting(room, `${player.name} called for a meeting.`);
        break;
      }

      /* Voting */
      case "voting": {
        const room = getRoom(msg.roomCode, ws);
        if (!room) return;

        if (room.status !== "meeting" || !room.meeting.votingEndsAt) {
          ws.send(
            JSON.stringify({ type: "error", message: "Voting not active" })
          );
          return;
        }

        const voter = room.players.find((p) => p.socketId === ws.id);
        if (!voter || !voter.isAlive) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Dead players cannot vote",
            })
          );
          return;
        }

        const choice = msg.suspectId || "skip";

        room.meeting.votes[ws.id] = choice;
        room.logs.push(`${voter.name} has voted.`);
        broadcastRoomState(room);
        break;
      }

      /* Chat */
      case "chat": {
        console.log("Firing chat");
        const room = getRoom(msg.roomCode, ws);

        if (!room) return;
        if (room.status !== "meeting") {
          ws.send(
            JSON.stringify({ type: "error", message: "Game not in meeting" })
          );
          return;
        }
        const player = room.players.find((p) => p.socketId === ws.id);
        if (!player || !player.isAlive) {
          return;
        }

        room.chats?.push({ name: msg.name, msg: msg.msg });
        broadcastRoomState(room);
        break;
      }

      case "restart-game": {
        console.log("Firing chat");
        const room = getRoom(msg.roomCode, ws);
        if (!room) return;
        if (room.status !== "ended") {
          ws.send(
            JSON.stringify({ type: "error", message: "Game hasn't ended." })
          );
          return;
        }
        room.players.forEach((p) => {
          p.isAlive = true;
          p.role = null;
          p.lastKillAt = 0;
        });
        room.status = "lobby";
        room.taskProgress = 0;
        room.logs = [];
        room.chats = [];
        room.lastFreezeAt = null;
        room.lastSabotageAt = null;
        room.freezeUntil = null;
        room.meeting = {
          discussionEndsAt: null,
          votingEndsAt: null,
          votes: {},
          hasMeeting: false,
        };

        room.logs.push("Game restarted.");
        broadcastRoomState(room);
        break;
      }

      default:
        ws.send(JSON.stringify({ type: "error", message: "Unknown event" }));
    }
  });

  ws.on("close", () => {
    for (const [roomCode, room] of rooms.entries()) {
      leavingPlayerSync(room, ws, roomCode);
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
