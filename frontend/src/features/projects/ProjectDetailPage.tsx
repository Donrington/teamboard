import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ListChecks, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import type { Task, TaskStatus } from '@teamboard/shared';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatRelative } from '@/lib/format';
import { useProject, useDeleteProject } from './useProjects';
import { ProjectFormDialog } from './components/ProjectFormDialog';
import { useTasks, useUpdateTask, useDeleteTask } from '../tasks/useTasks';
import { TaskBoard } from '../tasks/components/TaskBoard';
import { TaskFormDialog } from '../tasks/components/TaskFormDialog';

function BoardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-card bg-bone/50" />
      ))}
    </div>
  );
}

export function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();

  const project = useProject(projectId);
  const tasks = useTasks(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const deleteProject = useDeleteProject();

  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);

  if (project.isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-6 w-6 text-verdigris" />
      </div>
    );
  }
  if (project.isError || !project.data) {
    return <ErrorState message="This project could not be found." />;
  }

  const p = project.data;
  const taskList = tasks.data ?? [];

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };
  const onMove = (task: Task, status: TaskStatus) =>
    updateTask.mutate({ taskId: task.id, payload: { status } });

  return (
    <div>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-muted transition hover:text-ink"
      >
        <ArrowLeft size={14} /> All projects
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <span className="eyebrow">Project</span>
          <h1 className="mt-2.5 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {p.title}
          </h1>
          {p.description && <p className="mt-3 text-pretty text-muted">{p.description}</p>}
          <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-muted">
            <span>
              {taskList.length} {taskList.length === 1 ? 'task' : 'tasks'}
            </span>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span>Created {formatRelative(p.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setEditProjectOpen(true)}
            leadingIcon={<PencilSimple size={16} />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmDeleteProject(true)}
            leadingIcon={<Trash size={16} />}
          >
            Delete
          </Button>
          <Button onClick={openCreateTask} leadingIcon={<Plus size={18} weight="bold" />}>
            Add task
          </Button>
        </div>
      </header>

      <div className="mt-10">
        {tasks.isLoading ? (
          <BoardSkeleton />
        ) : tasks.isError ? (
          <ErrorState message="Could not load this project’s tasks." />
        ) : taskList.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={26} />}
            title="No tasks yet"
            description="Add your first task — it will land in the To Do column."
            action={
              <Button onClick={openCreateTask} leadingIcon={<Plus size={18} weight="bold" />}>
                Add task
              </Button>
            }
          />
        ) : (
          <TaskBoard
            tasks={taskList}
            onMove={onMove}
            onEdit={(task) => {
              setEditingTask(task);
              setTaskFormOpen(true);
            }}
            onDelete={setConfirmDeleteTask}
          />
        )}
      </div>

      <ProjectFormDialog open={editProjectOpen} onClose={() => setEditProjectOpen(false)} project={p} />
      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        projectId={projectId}
        task={editingTask}
      />

      <ConfirmDialog
        open={confirmDeleteProject}
        onClose={() => setConfirmDeleteProject(false)}
        title="Delete project?"
        description={`"${p.title}" and all of its tasks will be permanently removed.`}
        confirmLabel="Delete project"
        loading={deleteProject.isPending}
        onConfirm={async () => {
          await deleteProject.mutateAsync(p.id);
          navigate('/projects');
        }}
      />
      <ConfirmDialog
        open={Boolean(confirmDeleteTask)}
        onClose={() => setConfirmDeleteTask(null)}
        title="Delete task?"
        description={confirmDeleteTask ? `"${confirmDeleteTask.title}" will be removed.` : undefined}
        confirmLabel="Delete task"
        loading={deleteTask.isPending}
        onConfirm={async () => {
          if (!confirmDeleteTask) return;
          await deleteTask.mutateAsync(confirmDeleteTask.id);
          setConfirmDeleteTask(null);
        }}
      />
    </div>
  );
}
