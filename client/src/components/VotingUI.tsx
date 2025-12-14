export default function VotingUI({
  players,
  mySocketId,
  onVote,
}: {
  players: IPlayer[];
  mySocketId: string | null;
  onVote: (id: string | "skip") => void;
}) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">Select a player to eject:</p>

      <div className="grid grid-cols-1 gap-2">
        {players.map((p) => (
          <button
            key={p.socketId}
            onClick={() => onVote(p.socketId)}
            disabled={mySocketId === p.socketId}
            className="flex items-center justify-between p-2 border rounded bg-slate-50 hover:bg-red-50"
          >
            <span className="font-medium text-slate-700">{p.name}</span>
            <span className="text-xs text-slate-500">Vote</span>
          </button>
        ))}

        {/* SKIP BUTTON */}
        <button
          onClick={() => onVote("skip")}
          className="mt-2 w-full border border-slate-300 text-slate-600 py-2 rounded bg-white hover:bg-slate-50"
        >
          Skip Vote
        </button>
      </div>
    </div>
  );
}