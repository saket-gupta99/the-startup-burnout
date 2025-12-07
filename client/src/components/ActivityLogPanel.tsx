import { cn } from "../libs/utils";

interface ActivityLogPanelProps {
  title?: string;
  logs: string[];
  emptyMessage?: string;
  containerClassName?: string; 
}

export default function ActivityLogPanel({
  title = "Activity Log",
  logs,
  emptyMessage = "• Room created. Waiting for more players…",
  containerClassName = "",
}: ActivityLogPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col rounded-lg border border-slate-200 bg-white px-5 py-4",
        containerClassName
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
          {title}
        </h2>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-700">
        {!logs.length ? (
          <p className="text-slate-500">{emptyMessage}</p>
        ) : (
          logs.map((log, idx) => <p key={idx}>• {log}</p>)
        )}
      </div>
    </div>
  );
}
