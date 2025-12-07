import { useWebSocketContext } from "../context/WebSocketContext";
import Button from "./Button";

export default function Error({ globalError }: { globalError: string }) {
  const { setGlobalError } = useWebSocketContext();
  
  return (
    <main className="min-h-dvh flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-lg border border-red-300 bg-red-50 px-5 py-6 text-red-800">
        <h1 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-red-700">
            !
          </span>
          Connection Error
        </h1>

        <p className="text-sm mb-4">{globalError}</p>

        <Button variant="error" onClick={() => setGlobalError("")}>
          Dismiss & go back
        </Button>
      </div>
    </main>
  );
}
