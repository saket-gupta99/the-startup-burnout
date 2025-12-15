import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Button from "./Button";
import { playSound } from "../libs/utils";

interface TerminalTaskUIProps {
  onTaskComplete: () => void;
}

export default function CompileUI({ onTaskComplete }: TerminalTaskUIProps) {
  const sliderDomRef = useRef<HTMLDivElement | null>(null);
  const greenZoneRef = useRef<HTMLDivElement | null>(null);
  const sliderState = useRef<{
    position: number;
    direction: number;
    step: number;
    limit: number;
  }>({
    position: 0,
    direction: 1, // 1 for forward, -1 for backward
    step: 10,
    limit: 448, //in px
  });

  useEffect(() => {
    const slider = sliderDomRef.current;
    const state = sliderState.current;
    if (!slider) return;

    slider.style.left = "0px";
    const timerId = setInterval(() => {
      //calculate new position
      let newPos = state.position + state.direction * state.step;

      if (newPos >= state.limit) {
        state.direction = -1;
        newPos = state.limit;
      } else if (newPos <= 0) {
        state.direction = 1;
        newPos = 0;
      }
      state.position = newPos;
      slider.style.left = `${newPos}px`;
    }, 80);

    return () => clearInterval(timerId);
  }, []);

  function checkWithinGreenZone() {
    const slider = sliderDomRef.current;
    const greenZone = greenZoneRef.current;

    if (!slider || !greenZone) {
      playSound("/sounds/ui/error.mp3");
      toast.error("Something went wrong");
      return;
    }

    //to get position of element using getBoundingClientRect
    const sliderRect = slider.getBoundingClientRect();
    const greenZoneRect = greenZone.getBoundingClientRect();

    const isInside =
      sliderRect.left >= greenZoneRect.left &&
      sliderRect.right <= greenZoneRect.right;

    if (!isInside) {
      toast.error(
        "Compile failed! Try again when the bar is in the green zone."
      );
      return;
    }

    toast.success("Compiled successfully!");
    onTaskComplete();
  }

  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">
        Stop the slider in the green zone to compile the code.
      </p>

      <div className="h-3 w-full bg-slate-200 rounded-full relative overflow-hidden">
        {/* Green Zone */}
        <div
          className="absolute left-1/3 w-1/3 h-full bg-green-400 rounded-full"
          ref={greenZoneRef}
        />

        {/* Slider */}
        <div
          className="absolute left-0 h-full w-3 bg-blue-600 rounded-full shadow"
          ref={sliderDomRef}
        />
      </div>

      <Button variant="task" onClick={checkWithinGreenZone}>
        Compile
      </Button>
    </div>
  );
}
