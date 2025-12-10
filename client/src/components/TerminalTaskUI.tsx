import Button from "./Button";

interface TerminalTaskUIProps {
  onTaskComplete: () => void;
}

export function TerminalTaskUI({ onTaskComplete }: TerminalTaskUIProps) {
  // You will add state + verification logic
  const targetCommand = "npm run build";

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Run the correct command to build the project.
      </p>

      {/* Fake terminal window */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs font-mono overflow-hidden mb-3">
        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[0.65rem] text-slate-400">
            ~/projects/startup-burnout
          </span>
        </div>

        <div className="px-3 py-3 space-y-1">
          <p className="text-[0.7rem] text-slate-400">
            # Tip: Use npm to build the project
          </p>
          <p className="flex items-center text-[0.75rem]">
            <span className="text-emerald-400 mr-1">dev@remote-startup</span>
            <span className="mr-1 text-slate-400">~/app</span>
            <span className="text-slate-200">$</span>
            {/* You will replace this with a controlled input later */}
          </p>
        </div>
      </div>

      {/* Command input */}
      <input
        type="text"
        placeholder="Type your command here..."
        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-amber-400"
      />

      <Button variant="task" className="mt-3">
        Run command
      </Button>

      <p className="text-[0.7rem] text-slate-500 mt-2">
        (Store the input in state, compare to &quot;{targetCommand}&quot;, and
        call <code>onTaskComplete()</code> only when it matches.)
      </p>
    </div>
  );
}
