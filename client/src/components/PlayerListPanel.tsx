import { FaUsers } from "react-icons/fa";
import { cn } from "../libs/utils";

interface PlayerListPanelProps {
  title?: string;
  players: IPlayer[];
  totalSlots?: number;
  containerClassName?: string;
  emptyMessage?: string;
  attemptingToKill?: boolean;
  killPlayer?: (targetId: string) => void;
  mySocketId?: string | null
}

export default function PlayerListPanel({
  title = "Players",
  players,
  totalSlots = 10,
  containerClassName = "",
  emptyMessage = "Waiting for players…",
  attemptingToKill = false,
  killPlayer = () => {},
  mySocketId = null
}: PlayerListPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-slate-200 bg-white px-5 py-4",
        containerClassName
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUsers className="h-4 w-4 text-sky-500" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            {title}
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] text-slate-500">
          {players.length} / {totalSlots}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs">
        {!players.length && <p className="text-slate-500">{emptyMessage}</p>}

        {players.map((p) => (
          <div
            key={p.socketId}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            {/* Left: color + name + host */}
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-medium text-slate-700">{p.name}</span>
              {p.isHost && (
                <span className="text-[0.65rem] font-semibold text-amber-600">
                  (Host)
                </span>
              )}
            </div>

            {/* Right: status */}
            <div className="flex items-center gap-4">
              {attemptingToKill && mySocketId !== p.socketId && p.isAlive && (
                <button
                  className="text-red-600 uppercase border border-red-700 px-1 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    killPlayer(p.socketId);
                  }}
                  // disabled={mySocketId === p.socketId}
                >
                  kill
                </button>
              )}
              <span
                className={cn(
                  "text-[0.65rem]",
                  p.isAlive ? "text-green-600" : "text-red-500"
                )}
              >
                {p.isAlive ? "Alive" : "Dead"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
