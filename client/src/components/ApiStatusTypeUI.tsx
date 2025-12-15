import { useState } from "react";
import Button from "./Button";
import toast from "react-hot-toast";
import { playSound } from "../libs/utils";

interface ApiStatusTaskUIProps {
  onTaskComplete: () => void;
}

interface Service {
  id: number;
  name: string;
  status: "UP" | "DOWN";
}

const initialServices: Service[] = [
  { id: 1, name: "Auth API", status: Math.random() > 0.5 ? "UP" : "DOWN" },
  { id: 2, name: "Payments API", status: Math.random() > 0.5 ? "UP" : "DOWN" },
  { id: 3, name: "User Service", status: Math.random() > 0.5 ? "UP" : "DOWN" },
  {
    id: 4,
    name: "Notification API",
    status: Math.random() > 0.5 ? "UP" : "DOWN",
  },
  { id: 5, name: "Analytics API", status: Math.random() > 0.5 ? "UP" : "DOWN" },
];

export default function ApiStatusTaskUI({
  onTaskComplete,
}: ApiStatusTaskUIProps) {
  const [services] = useState<Service[]>(initialServices);
  const [markedDown, setMarkedDown] = useState<number[]>([]);

  function toggleService(id: number) {
    setMarkedDown((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function submit() {
    const wrong = services.some(
      (s) =>
        (s.status === "DOWN" && !markedDown.includes(s.id)) ||
        (s.status === "UP" && markedDown.includes(s.id))
    );

    if (wrong) {
      playSound("/sounds/ui/error.mp3");
      toast.error("Incorrect service status detected.");
      return;
    }

    toast.success("All services verified!");
    onTaskComplete();
  }

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        Identify all services that are currently DOWN.
      </p>

      <div className="space-y-2">
        {services.map((s) => {
          const selected = markedDown.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleService(s.id)}
              className={`w-full flex justify-between items-center px-3 py-2 rounded-md border text-sm
                ${
                  selected
                    ? "bg-red-50 border-red-300"
                    : "bg-white border-slate-200"
                }`}
            >
              <span className="font-medium">{s.name}</span>
              <span
                className={`text-xs font-semibold ${
                  s.status === "DOWN" ? "text-red-600" : "text-green-600"
                }`}
              >
                {selected ? "Marked" : "Tap to mark"}
              </span>
            </button>
          );
        })}
      </div>

      <Button variant="task" className="mt-4" onClick={submit}>
        Verify Services
      </Button>
    </div>
  );
}
