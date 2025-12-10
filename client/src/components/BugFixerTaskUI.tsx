import Button from "./Button";
import { FaBug } from "react-icons/fa6";

interface BugFixerTaskUIProps {
  onTaskComplete: () => void;
}

export function BugFixerTaskUI({ onTaskComplete }: BugFixerTaskUIProps) {
  // You will add drag/drop + validation logic later
  const modules = ["Auth Service", "Payment Gateway", "Dashboard UI"];

  const bugs = [
    { id: 1, title: "Login fails on correct password", module: "Auth Service" },
    { id: 2, title: "Double charge on checkout", module: "Payment Gateway" },
    { id: 3, title: "Graph not rendering", module: "Dashboard UI" },
  ];

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Assign each bug to the correct module.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Bugs list */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Bugs
          </h3>
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs"
              draggable
            >
              <FaBug className="h-3 w-3 text-red-500" />
              <div>
                <p className="font-medium text-slate-700">{bug.title}</p>
                <p className="text-[0.65rem] text-slate-500">
                  (Drag onto a module)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Modules */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Modules
          </h3>
          {modules.map((m) => (
            <div
              key={m}
              className="rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs"
            >
              <p className="font-semibold text-slate-700 mb-1">{m}</p>
              <p className="text-[0.7rem] text-slate-500">
                Drop matching bug here.
              </p>
              {/* Later: show assigned bugs inside this box */}
            </div>
          ))}
        </div>
      </div>

      <Button variant="task" className="mt-4">
        Run tests
      </Button>

      <p className="text-[0.7rem] text-slate-500 mt-2">
        (Implement drag &amp; drop, track which bug is on which module, and only
        call <code>onTaskComplete()</code> if all matches are correct.)
      </p>
    </div>
  );
}
