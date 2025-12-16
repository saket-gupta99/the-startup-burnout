import { useState } from "react";
import toast from "react-hot-toast";

interface Email {
  id: number;
  subject: string;
  spam: boolean;
}
interface TerminalTaskUIProps {
  onTaskComplete: () => void;
}

export default function SpamFilterUI({ onTaskComplete }: TerminalTaskUIProps) {
  const [emails, setEmails] = useState<Email[]>([
    { id: 1, subject: "WIN $1000 NOW!!!", spam: true },
    { id: 2, subject: "Team Meeting at 4 PM", spam: false },
    { id: 3, subject: "URGENT: Account Suspended", spam: true },
    { id: 4, subject: "Interview Scheduled at 4PM", spam: false },
    { id: 5, subject: "Made a payment of $10.00 to a merchant", spam: false },
    { id: 6, subject: "Nigerian Prince needs help", spam: true },
  ]);

  const [_trash, setTrash] = useState<Email[]>([]);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("emailId"));
    const email = emails.find((m) => m.id === id);
    if (!email) return;

    // dont let legitimate email to be put in trash
    if (!email.spam) {
      toast.error("That’s a legitimate email! Don't delete it.");
      return;
    }

    // Move to trash
    setEmails((prev) => prev.filter((m) => m.id !== id));
    setTrash((prev) => [...prev, email]);

    // Check task completion
    const totalSpam = emails.filter((m) => m.spam).length;
    if (totalSpam === 1) {
      toast.success("All spam removed!");
      onTaskComplete();
    }
  }

  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">
        Drag spam emails into the trash bin.
      </p>

      {/* EMAIL LIST */}
      <div className="space-y-2 mb-6">
        {emails.map((email) => (
          <EmailItemUI key={email.id} email={email} />
        ))}
      </div>

      {/* TRASH BIN */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="h-20 bg-red-100 border-2 border-red-400 border-dashed rounded-lg flex items-center justify-center text-red-600 font-semibold"
      >
        🗑️ Drag Spam Here
      </div>
    </div>
  );
}

function EmailItemUI({ email }: { email: Email }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("emailId", String(email.id))}
      className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-3 py-2 cursor-grab active:cursor-grabbing"
    >
      <span className="text-slate-700">{email.subject}</span>

      {email.spam && (
        <span className="px-2 py-1 text-[0.65rem] rounded bg-red-100 text-red-600 font-semibold">
          SPAM
        </span>
      )}
    </div>
  );
}
