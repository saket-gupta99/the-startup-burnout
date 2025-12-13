import { FaUserSecret, FaUserTie } from "react-icons/fa";

export default function RoleCard({ role }: { role: string | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <p className="text-[0.7rem] uppercase tracking-widest text-slate-500">
        Your Role
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
          {role === "spy" ? (
            <FaUserSecret className="h-5 w-5 text-red-500" />
          ) : (
            <FaUserTie className="h-5 w-5 text-green-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 uppercase">
            {role}
          </p>
          <p className="text-xs text-slate-500">
            Crew: finish tasks. Spy: sabotage and eliminate others.
          </p>
        </div>
      </div>
    </div>
  );
}
