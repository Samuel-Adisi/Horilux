import { useState } from "react";
import { useStaffDirectory } from "@/features/dashboard/hooks/use-staff-directory";
import { useCreateTask } from "../hooks/use-tasks";

interface ScheduleBriefingModalProps {
  onClose: () => void;
}

export function ScheduleBriefingModal({ onClose }: ScheduleBriefingModalProps) {
  const [title, setTitle] = useState("Executive Briefing");
  const [dueDate, setDueDate] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const { data: staffData, isLoading: staffLoading } = useStaffDirectory();
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(
      {
        title,
        due_date: dueDate || undefined,
        owner: ownerId || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#131926] p-6">
        <h2 className="text-lg font-bold text-white">Schedule Exec Briefing</h2>
        <p className="mt-1 text-xs text-slate-400">
          Creates a task assigned to a staff member with an optional due date.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assignee
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              disabled={staffLoading}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {staffData?.staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {createTask.isError && (
            <p className="text-xs text-red-400">
              Failed to create task. Please try again.
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
            >
              {createTask.isPending ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
