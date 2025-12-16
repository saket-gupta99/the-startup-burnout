import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { playSound } from "../libs/utils";

interface GameOverModalProps {
  outcome: string;
  onPlayAgain: () => void;
  onStay: () => void;
}

export default function GameOverModal({
  outcome,
  onPlayAgain,
  onStay,
}: GameOverModalProps) {
  const preserveOutcomeRef = useRef<string | null>(null);

  //unnecessarily music was playing so created this 
  useEffect(() => {
    preserveOutcomeRef.current = outcome;
  }, []);

  useEffect(() => {
    if (outcome !== preserveOutcomeRef.current) return;
    if (outcome.includes("Crew")) {
      playSound("/sounds/result/crew-win.mp3");
    } else {
      playSound("/sounds/result/spy-win.mp3");
    }
  }, [outcome, preserveOutcomeRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white px-5 py-6 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Game Over
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {outcome || "The game has ended"}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          The game has ended. You may review the log or start a new round.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="basic" className="sm:w-auto" onClick={onStay}>
            Stay & view log
          </Button>

          <Button className="sm:w-auto" onClick={onPlayAgain}>
            Play again
          </Button>
        </div>
      </div>
    </div>
  );
}
