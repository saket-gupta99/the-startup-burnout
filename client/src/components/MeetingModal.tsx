import { useEffect, useState } from "react";
import VotingUI from "./VotingUI";
import DiscussionUI from "./DiscussionUI";

interface MeetingModalProps {
  roomState: IRoomState;
  mySocketId: string | null;
  ws: WebSocket | null;
}

export default function MeetingModal({
  roomState,
  mySocketId,
  ws,
}: MeetingModalProps) {
  const meeting = roomState.meeting;

  const [phase, setPhase] = useState<"discussion" | "voting">("discussion");
  const [timeLeft, setTimeLeft] = useState(0);
  const alivePlayers = roomState.players.filter((p) => p.isAlive);
  const currPlayer = roomState.players.find((p) => p.socketId === mySocketId);

  // Determine current phase based on timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (meeting.discussionEndsAt && now < meeting.discussionEndsAt) {
        setPhase("discussion");
        setTimeLeft(Math.ceil((meeting.discussionEndsAt - now) / 1000));
      } else if (meeting.votingEndsAt && now < meeting.votingEndsAt) {
        setPhase("voting");
        setTimeLeft(Math.ceil((meeting.votingEndsAt - now) / 1000));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [meeting.discussionEndsAt, meeting.votingEndsAt]);

  function submitVote(targetId: string | "skip") {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: "voting",
        roomCode: roomState.roomCode,
        suspectId: targetId,
      })
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Emergency Meeting
        </h1>

        {/* Timer */}
        <div className="text-sm font-semibold text-slate-600 mb-4">
          {phase === "discussion"
            ? `Discussion ends in ${timeLeft}s`
            : `Voting ends in ${timeLeft}s`}
        </div>

        {/* PHASE UI */}
        {phase === "discussion" && (
          <DiscussionUI roomState={roomState} mySocketId={mySocketId} ws={ws} />
        )}

        {phase === "voting" && currPlayer?.isAlive && (
          <VotingUI
            players={alivePlayers}
            mySocketId={mySocketId}
            onVote={submitVote}
            votes={meeting.votes}
          />
        )}
      </div>
    </div>
  );
}
