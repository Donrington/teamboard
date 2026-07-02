import { AnimatePresence, motion } from 'framer-motion';
import { TASK_STATUSES, type Task, type TaskStatus } from '@teamboard/shared';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onMove: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/**
 * Three-column status board. Cards animate between columns via Framer Motion's shared
 * `layout` — when a task's status changes, it glides to its new column instead of
 * blinking (docs/07).
 */
export function TaskBoard({ tasks, onMove, onEdit, onDelete }: TaskBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TASK_STATUSES.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        return (
          <section key={status} className="rounded-card bg-fog/50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <StatusBadge status={status} />
              <span className="font-mono text-[11px] text-muted">{items.length}</span>
            </div>
            <motion.div layout className="min-h-[88px] space-y-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TaskCard task={task} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <p className="px-1 py-6 text-center font-mono text-[11px] text-muted/70">
                  Nothing here
                </p>
              )}
            </motion.div>
          </section>
        );
      })}
    </div>
  );
}
