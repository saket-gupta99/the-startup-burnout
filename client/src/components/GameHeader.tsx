export default function GameHeader({
  roomCode,
  status,
}: {
  roomCode: string;
  status?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        In Game
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight">
        The Startup: <span className="text-amber-500">Burnout</span>
      </h1>
      <p className="mt-2 text-xs text-slate-600 md:text-sm">
        Complete tasks to ship the product or sabotage the launch as the spy.
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
        <div>
          <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
            Room Code
          </p>
          <p className="mt-1 font-mono text-sm tracking-widest">{roomCode}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
            Status
          </p>
          <p className="mt-1 text-green-600 font-medium uppercase">{status}</p>
        </div>
      </div>
    </div>
  );
}
