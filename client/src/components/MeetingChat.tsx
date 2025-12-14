import { useState } from "react";
import Button from "./Button";

interface MeetingChatProps {
  chats: { name: string; msg: string }[];
  name: string | null;
  ws: WebSocket | null;
  roomCode: string
}

export default function MeetingChat({ chats, name, ws,roomCode }: MeetingChatProps) {
  const [message, setMessage] = useState("");

  function sendMessage() {
    if (!ws || !message.trim()) return;

    ws.send(
      JSON.stringify({
        type: "chat",
        roomCode,
        msg: message,
        name,
      })
    );

    setMessage("");
  }

  return (
    <div className="flex flex-col rounded-lg border border-slate-300 bg-slate-50 p-3">
      <h2 className="text-sm font-semibold mb-2 text-slate-700">
        Discussion Chat
      </h2>

      <div className="flex-1 overflow-y-auto space-y-1 mb-3 bg-white border rounded p-2 text-xs">
        {chats.length === 0 && (
          <p className="text-slate-400">No messages yet…</p>
        )}

        {chats.map((c, idx) => (
          <div key={idx} className="flex gap-1">
            <span className="font-semibold text-slate-700">{c.name}:</span>
            <span>{c.msg}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type to chat…"
          className="flex-1 border px-2 py-1 rounded text-sm"
        />
        <Button variant="primary" onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}
