import { FaTimes, FaTasks } from "react-icons/fa";
import { formatTitle } from "../libs/utils";
import CompileUI from "./CompileUI";
import DataEntryUI from "./DataEntryUI";
import SpamFilterUI from "./SpamFilterUI";
import CaptchaTaskUI from "./CaptchaTaskUI";
import BugFixerTaskUI from "./BugFixerTaskUI";
import TerminalTaskUI from "./TerminalTaskUI";

interface TaskModalProps {
  isOpen: boolean;
  taskType?: Tasks;
  onClose: () => void;
  onTaskComplete?: () => void;
}

export default function TaskModal({
  isOpen,
  taskType = "compile",
  onClose,
  onTaskComplete = () => {},
}: TaskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
          onClick={onClose}
        >
          <FaTimes className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaTasks className="text-amber-500" />
            Task: {formatTitle(taskType)}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete this task to help launch the product.
          </p>
        </div>

        {/* Task Body */}
        <div className="mt-4">
          {taskType === "compile" && (
            <CompileUI onTaskComplete={onTaskComplete} />
          )}
          {taskType === "data-entry" && (
            <DataEntryUI onTaskComplete={onTaskComplete} />
          )}
          {taskType === "spam-filter" && (
            <SpamFilterUI onTaskComplete={onTaskComplete} />
          )}
          {taskType === "captcha" && (
            <CaptchaTaskUI onTaskComplete={onTaskComplete} />
          )}
          {taskType === "bug" && (
            <BugFixerTaskUI onTaskComplete={onTaskComplete} />
          )}
          {taskType === "terminal" && (
            <TerminalTaskUI onTaskComplete={onTaskComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
