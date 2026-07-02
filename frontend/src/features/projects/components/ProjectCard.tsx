import { Link } from 'react-router-dom';
import { ArrowUpRight, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Project } from '@teamboard/shared';
import { formatRelative } from '@/lib/format';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

/** A project as an editorial card that links to its board; edit/delete reveal on hover. */
export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const count = project.taskCount ?? 0;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group surface relative flex h-full flex-col p-6 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="absolute right-3.5 top-3.5 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit(project);
          }}
          aria-label="Edit project"
          className="rounded-control p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
        >
          <PencilSimple size={16} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(project);
          }}
          aria-label="Delete project"
          className="rounded-control p-1.5 text-muted transition hover:bg-[#9F2F2D]/10 hover:text-[#9F2F2D]"
        >
          <Trash size={16} />
        </button>
      </div>

      <span className="font-mono text-[11px] uppercase tracking-label text-muted">
        {count} {count === 1 ? 'task' : 'tasks'}
      </span>

      <h3 className="mt-3 pr-12 font-display text-2xl font-semibold leading-tight tracking-tight">
        {project.title}
      </h3>

      {project.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{project.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-8">
        <span className="font-mono text-[11px] text-muted">
          Updated {formatRelative(project.updatedAt)}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-fog text-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
