import { PencilSimple, Trash } from '@phosphor-icons/react';
import { TaskStatus, TASK_STATUSES, type Task } from '@teamboard/shared';
import { cn } from '@/lib/cn';

/** Compact labels for the inline segmented control (full labels live on the columns). */
const SHORT: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'Doing',
  [TaskStatus.Done]: 'Done',
};

interface TaskCardProps {
  task: Task;
  onMove: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/**
 * A task tile. The segmented control at the bottom moves the task between statuses in
 * one click (applied optimistically upstream), which animates it to its new column.
 */
export function TaskCard({ task, onMove, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="group surface bg-bone p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="rounded-md p-1 text-muted transition hover:bg-ink/5 hover:text-ink"
          >
            <PencilSimple size={15} />
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            className="rounded-md p-1 text-muted transition hover:bg-[#9F2F2D]/10 hover:text-[#9F2F2D]"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted">{task.description}</p>
      )}

      <div className="mt-3.5 flex items-center gap-1 rounded-control bg-fog/70 p-1">
        {TASK_STATUSES.map((s) => {
          const active = s === task.status;
          return (
            <button
              key={s}
              onClick={() => !active && onMove(task, s)}
              aria-pressed={active}
              className={cn(
                'flex-1 rounded-[7px] px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition',
                active ? 'bg-bone text-ink shadow-soft' : 'text-muted hover:text-ink',
              )}
            >
              {SHORT[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
