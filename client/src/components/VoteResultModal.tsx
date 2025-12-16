import { useEffect } from "react";
import { playSound } from "../libs/utils";

export default function VoteResultModal({
  results,
  onClose,
  players,
}: {
  results: VotingResult;
  onClose: () => void;
  players: IPlayer[];
}) {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    if (results.ejectedPlayer && !results.isSpy) {
      playSound("/sounds/result/ejected.mp3");
    }
  }, [results.ejectedPlayer, results.isSpy]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-80 text-center">
        <h2 className="text-lg font-bold text-slate-800 mb-3">
          Voting Results
        </h2>

        {/* Vote Tally */}
        <div className="space-y-1 text-sm mb-4">
          {Object.entries(results.tally).map(([playerId, count]) => {
            const playerName = players.find(
              (p) => p.socketId === playerId
            )?.name;
            return (
              <p key={playerId} className="text-slate-700">
                {playerName || "Spy"}:{" "}
                <span className="font-semibold">{count} votes</span>
              </p>
            );
          })}
        </div>

        {/* Result */}
        <p
          className={`font-medium ${
            results.ejectedPlayer ? "text-red-600" : "text-slate-600"
          }`}
        >
          {results.reason}
        </p>
      </div>
    </div>
  );
}
