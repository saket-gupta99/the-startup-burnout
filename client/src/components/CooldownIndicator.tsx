interface CooldownIndicatorProps {
  label: string;
  sublabel: string;
  seconds: number;
  maxSeconds: number;
  barColor: string;
}

export default function CooldownIndicator({
  label,
  sublabel,
  seconds,
  maxSeconds,
  barColor,
}: CooldownIndicatorProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-700">{label}</div>
          <div className="text-[0.7rem] text-slate-500">{sublabel}</div>
        </div>
        <div className="text-sm font-mono text-slate-700">{seconds}s</div>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{
            width: `${Math.max(0, (seconds / maxSeconds) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}