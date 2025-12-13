import { FaTasks } from "react-icons/fa";

export default function TaskProgress({
  taskProgress,
}: {
  taskProgress: number | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaTasks className="h-4 w-4 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-800">
            Product Launch Progress
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600">
          {taskProgress}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${taskProgress}%` }}
        />
      </div>

      <p className="mt-2 text-[0.7rem] text-slate-500">
        Complete tasks to reach 100% and successfully launch the product.
      </p>
    </div>
  );
}
