import { useRef, useState } from "react";
import Button from "./Button";
import toast from "react-hot-toast";
import { playSound } from "../libs/utils";

interface TerminalTaskUIProps {
  onTaskComplete: () => void;
}

const ACCEPTED_COMMANDS = ["npm run build", "yarn build", "pnpm build"];

function normalizeCommand(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export default function TerminalTaskUI({
  onTaskComplete,
}: TerminalTaskUIProps) {
  const [command, setCommand] = useState("");
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSubmit() {
    const normalized = normalizeCommand(command);
    if (!normalized) {
      playSound("/sounds/ui/error.mp3");
      toast.error("Type a command first.");
      return;
    }
    if (!ACCEPTED_COMMANDS.includes(normalized)) {
      playSound("/sounds/ui/error.mp3");
      toast.error("Incorrect command!");
      return;
    }

    // simulate a short build process for UX
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      toast.success("Build succeeded — Terminal task complete!");
      onTaskComplete();
    }, 900);
  }

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

        <div className="px-3 py-3 space-y-2">
          <p className="text-[0.7rem] text-slate-400">
            # Tip: Use npm or yarn to build the project
          </p>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400">dev@remote-startup</span>
            <span className="text-slate-400">~/app</span>
            <span className="text-slate-200 font-mono">$</span>

            <input
              ref={inputRef}
              autoFocus
              aria-label="Terminal command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Type your command here..."
              className="ml-2 bg-transparent outline-none text-slate-100 placeholder:text-slate-500 w-full"
            />
          </div>

          {running && (
            <div className="text-[0.7rem] text-slate-400">Running build...</div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="task"
          className="grow"
          onClick={handleSubmit}
          disabled={running}
        >
          {running ? "Running..." : "Run command"}
        </Button>
      </div>
    </div>
  );
}
