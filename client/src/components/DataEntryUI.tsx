import { useState } from "react";
import toast from "react-hot-toast";
import Button from "./Button";
import { playSound } from "../libs/utils";

interface TerminalTaskUIProps {
  onTaskComplete: () => void;
}

function DataEntryUI({ onTaskComplete }: TerminalTaskUIProps) {
  const [form, setForm] = useState({
    name: "Jhon Doe",       
    email: "userexample.com",
    date: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errors: string[] = [];

    if (!form.name.trim()) {
      errors.push("Name is required.");
    }

    if (form.name !== "John Doe") {
      errors.push("Correct the name to John Doe");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      errors.push("Enter a valid email address.");
    }

    if (!form.date.trim()) {
      errors.push("Date is required.");
    }

    if (errors.length) {
      playSound("/sounds/ui/error.mp3");
      toast.error(errors[0]); 
      return false;
    }

    return true;
  }

  function handleSubmit() {
    const ok = validate();
    if (!ok) return;

    toast.success("Form fixed successfully!");
    onTaskComplete();
  }

  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">
        Fix the incorrect information in these fields.
      </p>

      <div className="space-y-2">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="date"
          placeholder="Date (e.g. 2025-12-31)"
          value={form.date}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <Button variant="task" className="mt-4" onClick={handleSubmit}>
        Save changes
      </Button>
    </div>
  );
}

export default DataEntryUI;
