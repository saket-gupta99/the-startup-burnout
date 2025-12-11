import React, { useState } from "react";
import Button from "./Button";
import { FaBug } from "react-icons/fa6";
import toast from "react-hot-toast";

interface BugFixerTaskUIProps {
  onTaskComplete: () => void;
}

interface Bug {
  id: number;
  title: string;
  module: Module;
}

type Module = "Auth Service" | "Payment Gateway" | "Dashboard UI";

type GroupedBugs = {
  [K in Module]: Bug[];
};

const modules: Module[] = ["Auth Service", "Payment Gateway", "Dashboard UI"];

const initialBugs: Bug[] = [
  { id: 1, title: "Graph not rendering", module: "Dashboard UI" },
  { id: 2, title: "Login fails on correct password", module: "Auth Service" },
  { id: 3, title: "Double charge on checkout", module: "Payment Gateway" },
  { id: 4, title: "Slider not moving", module: "Dashboard UI" },
  {
    id: 5,
    title: "User not created in DB on sign up",
    module: "Auth Service",
  },
];

export default function BugFixerTaskUI({ onTaskComplete }: BugFixerTaskUIProps) {
  const [assignedBugs, setAssignedBugs] = useState<GroupedBugs>({
    "Auth Service": [],
    "Dashboard UI": [],
    "Payment Gateway": [],
  });
  const [unassignedBugs, setUnassignedBugs] = useState<Bug[]>(initialBugs);

  function handleDrop(e: React.DragEvent<HTMLDivElement>, module: Module) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("bugId"));
    const bug = unassignedBugs.find((b) => b.id === id);

    if (!bug) return;

    //not checking if bug is in correct module
    setUnassignedBugs((bugs) => bugs.filter((bug) => bug.id !== id));
    setAssignedBugs((prev) => {
      const bucket = prev[module] ?? [];
      return { ...prev, [module]: [...bucket, bug] };
    });
  }

  //if user removes a bug from module. filter it out from assigned and put it back to unassigned
  function removeFromModule(module: Module, bugId: number) {
    const removed = assignedBugs[module].find((m) => m.id === bugId);

    if (removed) {
      setAssignedBugs((prev) => ({
        ...prev,
        [module]: prev[module].filter((m) => m.id !== bugId),
      }));
      setUnassignedBugs((prevAll) => [...prevAll, removed]);
    }
  }

  // Run tests: find mismatches and report them. If none -> success.
  function runTest() {
    const wrongs: { bug: Bug; placedIn: Module }[] = [];

    for (const m of modules) {
      const bucket = assignedBugs[m];
      for (const b of bucket) {
        if (b.module !== m) {
          wrongs.push({ bug: b, placedIn: m });
        }
      }
    }

    if (unassignedBugs.length > 0) {
      toast.error(`There are ${unassignedBugs.length} unassigned bug(s).`);
      return;
    }

    if (wrongs.length > 0) {
      const message = wrongs
        .map(
          (w) =>
            `"${w.bug.title}" placed in ${w.placedIn} (should be in ${w.bug.module})`
        )
        .join("; ");
      toast.error(`Some bugs are in the wrong moduel: ${message}`, {
        duration: 5000,
      });
      return;
    }

    toast.success("All bugs assigned correctly — tests passed!");
    onTaskComplete();
  }

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Assign each bug to the correct module.
      </p>

      <div className="max-h-[60vh] overflow-y-auto pr-2 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Bugs list */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Bugs
            </h3>

            {unassignedBugs.length === 0 && (
              <div className="text-xs text-slate-500">No unassigned bugs.</div>
            )}

            {unassignedBugs.map((bug) => (
              <div
                key={bug.id}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("bugId", String(bug.id))
                }
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
            {modules.map((m) => {
              const bucket = assignedBugs[m] || [];
              return (
                <div
                  key={m}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, m)}
                  className="rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-700 mb-1">{m}</p>
                      <p className="text-[0.7rem] text-slate-500">
                        Drop bugs here
                      </p>
                    </div>
                    <div className="text-[0.7rem] text-slate-500">
                      {bucket.length} assigned
                    </div>
                  </div>

                  {/* Assigned bugs (show wrong ones visually) */}
                  <div className="mt-3 space-y-2">
                    {bucket.length === 0 && (
                      <div className="text-[0.8rem] text-slate-400">
                        No bugs assigned yet.
                      </div>
                    )}

                    {bucket.map((assigned) => {
                      const isWrong = assigned.module !== m;
                      return (
                        <div
                          key={assigned.id}
                          className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs 
                            ${
                              isWrong
                                ? "border-red-200 bg-red-50"
                                : "border-slate-200 bg-white"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaBug
                              className={`h-3 w-3 ${
                                isWrong ? "text-red-600" : "text-red-500"
                              }`}
                            />
                            <span className="font-medium text-slate-700">
                              {assigned.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isWrong && (
                              <span className="text-[0.65rem] px-2 py-0.5 rounded bg-red-100 text-red-700">
                                Wrong
                              </span>
                            )}
                            <button
                              className="text-xs text-slate-500 hover:underline"
                              onClick={() => removeFromModule(m, assigned.id)}
                              type="button"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Button variant="task" className="mt-4" onClick={runTest}>
        Run tests
      </Button>
    </div>
  );
}
