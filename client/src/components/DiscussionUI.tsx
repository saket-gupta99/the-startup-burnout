import MeetingChat from "./MeetingChat";
import PlayerListPanel from "./PlayerListPanel";

interface DiscussionUIProps {
  roomState: IRoomState;
  mySocketId: string | null;
  ws: WebSocket | null;
}

export default function DiscussionUI({
  roomState,
  mySocketId,
  ws,
}: DiscussionUIProps) {
  const player = roomState.players.find((p) => p.socketId === mySocketId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MeetingChat
        chats={roomState.chats ?? []}
        name={player?.name || "Player"}
        ws={ws}
        roomCode={roomState.roomCode}
      />
      <PlayerListPanel
        title="Alive Players"
        players={roomState.players.filter((p: IPlayer) => p.isAlive)}
        totalSlots={10}
      />
    </div>
  );
}
