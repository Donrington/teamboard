import { TaskStatus, TASK_STATUS_LABEL } from '@teamboard/shared';
import { cn } from '@/lib/cn';

/**
 * Task-status chip using the exact brand status mapping (docs/00 §6):
 * TODO → Slate, IN PROGRESS → Brass, DONE → Verdigris. Text is darkened for contrast;
 * the dot carries the pure brand accent.
 */
const STATUS_STYLES: Record<TaskStatus, { chip: string; dot: string }> = {
  [TaskStatus.Todo]: { chip: 'bg-slate/[0.07] text-slate border-slate/20', dot: 'bg-slate' },
  [TaskStatus.InProgress]: { chip: 'bg-brass-soft text-[#8A6A2B] border-brass/30', dot: 'bg-brass' },
  [TaskStatus.Done]: { chip: 'bg-verdigris-soft text-[#2F5C50] border-verdigris/30', dot: 'bg-verdigris' },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'font-mono text-[10px] uppercase tracking-[0.14em]',
        s.chip,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}
