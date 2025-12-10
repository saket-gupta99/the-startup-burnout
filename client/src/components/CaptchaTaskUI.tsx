import Button from "./Button";

interface CaptchaTaskUIProps {
  onTaskComplete: () => void;
}

export function CaptchaTaskUI({ onTaskComplete }: CaptchaTaskUIProps) {
  // You will add state + validation here later
  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Prove you&apos;re not a bot. Solve all CAPTCHAs correctly.
      </p>

      <div className="space-y-4">
        {/* CAPTCHA 1 */}
        <div className="space-y-2">
          <div className="h-16 w-full rounded-md bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-mono">
            3G7KQ
          </div>
          <input
            type="text"
            placeholder="Type the text above"
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* CAPTCHA 2 */}
        <div className="space-y-2">
          <div className="h-16 w-full rounded-md bg-slate-200 flex flex-col items-center justify-center text-slate-600 text-xs">
            <span className="font-semibold">Select all computers</span>
            <span className="text-[0.65rem] text-slate-500">
              (Imagine image grid here)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[0.7rem]">
            <button className="border border-slate-300 rounded-md py-2 bg-white">
              Laptop
            </button>
            <button className="border border-slate-300 rounded-md py-2 bg-white">
              Coffee
            </button>
            <button className="border border-slate-300 rounded-md py-2 bg-white">
              Server
            </button>
          </div>
        </div>

        {/* CAPTCHA 3 */}
        <div className="space-y-2">
          <div className="h-16 w-full rounded-md bg-slate-200 flex items-center justify-center text-slate-600 text-xs">
            What is <span className="mx-1 font-semibold">5 + 7</span>?
          </div>
          <input
            type="number"
            placeholder="Answer"
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      <Button variant="task" className="mt-4">
        Verify
      </Button>

      <p className="text-[0.7rem] text-slate-500 mt-2">
        (Wire the inputs, validate all answers, and call{" "}
        <code>onTaskComplete()</code> on success.)
      </p>
    </div>
  );
}
