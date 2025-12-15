import { useState } from "react";
import Button from "./Button";
import toast from "react-hot-toast";
import { playSound } from "../libs/utils";

interface LogSequenceTaskUIProps {
  onTaskComplete: () => void;
}

const correctOrder = [
  "Server started",
  "Database connected",
  "Routes initialized",
  "Listening on port 4000",
];

export default function LogSequenceTaskUI({
  onTaskComplete,
}: LogSequenceTaskUIProps) {
  const [remaining, setRemaining] = useState<string[]>(() =>
    [...correctOrder].sort(() => Math.random() - 0.5)
  );
  const [selected, setSelected] = useState<string[]>([]);

  function pick(log: string) {
    setRemaining((r) => r.filter((x) => x !== log));
    setSelected((s) => [...s, log]);
  }

  function reset() {
    setRemaining([...correctOrder].sort(() => Math.random() - 0.5));
    setSelected([]);
  }

  function submit() {
    const correct =
      selected.length === correctOrder.length &&
      selected.every((l, i) => l === correctOrder[i]);

    if (!correct) {
      playSound("/sounds/ui/error.mp3");
      toast.error("Logs are in the wrong order.");
      reset();
      return;
    }

    toast.success("Execution order fixed!");
    onTaskComplete();
  }

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Tap the logs in the correct execution order.
      </p>

      {/* Selected order */}
      <div className="mb-3 space-y-1">
        {selected.map((log, i) => (
          <div
            key={i}
            className="px-3 py-1 text-xs rounded bg-slate-100 border"
          >
            {i + 1}. {log}
          </div>
        ))}
      </div>

      {/* Remaining logs */}
      <div className="space-y-2">
        {remaining.map((log) => (
          <button
            key={log}
            onClick={() => pick(log)}
            className="w-full px-3 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
          >
            {log}
          </button>
        ))}
      </div>

      <Button variant="task" className="mt-4" onClick={submit}>
        Submit Order
      </Button>
    </div>
  );
}
