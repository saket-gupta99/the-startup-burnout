# The Startup: Burnout 🔥

**The Startup: Burnout** is a real-time multiplayer social deduction game inspired by *Among Us*, reimagined in a modern tech-startup setting.  
Players work together as a remote startup team to launch a product — while one hidden **Corporate Spies** try to sabotage the launch from within.

The game focuses on **real-time interaction**, **short skill-based tasks**, and **player-driven tension** rather than heavy visuals.

---

## 🎮 Game Overview

### Roles
- **Crew (Developers / Interns)**  
  Complete tasks to push the product launch to 100%.

- **Spy (Corporate Spy)**  
  Secretly sabotages progress, freezes players, and eliminates crew members without being discovered.

---

## 🧠 Core Gameplay Loop

1. Players join a lobby using a shared room code.
2. The host starts the game.
3. Roles are assigned secretly.
4. Crew members complete tasks to increase launch progress.
5. The Spy disrupts progress using special abilities.
6. Emergency meetings can be called to discuss and vote.
7. The game ends when:
   - Crew reaches 100% progress, or
   - The Spy eliminates enough players, or
   - The Spy is correctly voted out.

---

## 🧩 Tasks (Mini-Games)

Tasks are lightweight, logic-based challenges designed to be completed quickly:

- **Bug Fixer**  
  Assign bugs to the correct system modules.

- **Spam Filter**  
  Identify and remove spam emails.

- **Log Sequence (Mobile Friendly)**  
  Reorder system logs in the correct execution sequence.

- **Other Logic Tasks**  
  Designed to work well on both desktop and mobile.

> Task selection adapts to device type — drag-and-drop tasks are skipped on mobile devices.

---

## 🕵️ Spy Abilities

- **Kill**  
  Eliminate a crew member (cooldown-based).

- **Sabotage**  
  Reduce overall task progress.

- **DDOS / Freeze**  
  Temporarily freeze all crew actions.

- **Emergency Meetings**  
  Any alive player can call a meeting to discuss and vote.

Each ability has its own cooldown to prevent spamming and encourage timing-based play.

---

## 🗳️ Meetings & Voting

- Meetings consist of:
  - **Discussion Phase** – Chat with other players.
  - **Voting Phase** – Vote to eject a suspect or skip.
- Voting results are shown to all players.
- If the spy is ejected, the crew wins.
- Otherwise, the game continues.

---

## 🧱 Tech Stack

### Frontend
- **React + TypeScript**
- **Tailwind CSS**
- **React Router**
- **Context API** for global state
- **Custom animations & UI effects**

### Backend
- **Node.js**
- **WebSocket (ws)**
- **In-memory game state management**
- **Event-driven real-time updates**

---

## ⚙️ Architecture Highlights

- Real-time multiplayer using WebSockets
- Single source of truth on the server
- Client derives UI state from server timestamps
- No authentication (quick session-based gameplay)
- Optimized for short play sessions

---

## 📱 Device Support

- Desktop and mobile browsers supported
- Task system adapts based on device capabilities
- Mobile avoids drag-and-drop–only interactions

---

## 🧪 Design Philosophy

- **Low learning curve**
- **High replayability**
- **Minimal UI, maximum tension**
- Focus on *game feel* over complexity

---

## 🔁 Replayability

- Random role assignment
- Randomized task selection
- Dynamic player interactions
- Restart game without leaving the room

---

## 🚀 Status

This project is a **fully playable prototype** showcasing:
- Real-time multiplayer systems
- Game state synchronization
- UI/UX polish for social games

Future improvements may include:
- Multiple spies
- Custom task packs
- Player statistics
- Persistent rooms

---

**Made for learning, experimentation, and fun.**  
Welcome to the startup — try not to burn out. 🔥
