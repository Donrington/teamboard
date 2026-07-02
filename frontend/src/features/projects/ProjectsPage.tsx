import { useState } from 'react';
import { FolderOpen, Plus } from '@phosphor-icons/react';
import type { Project } from '@teamboard/shared';

import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useProjects, useDeleteProject } from './useProjects';
import { ProjectCard } from './components/ProjectCard';
import { ProjectFormDialog } from './components/ProjectFormDialog';

function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="surface h-52 animate-pulse bg-bone/60" />
      ))}
    </div>
  );
}

export function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const deleteProject = useDeleteProject();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (project: Project) => {
    setEditing(project);
    setFormOpen(true);
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1 className="mt-2.5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Your projects
          </h1>
          <p className="mt-2.5 max-w-md text-muted">
            Every project you own, each with its live task count. Open one to work its board.
          </p>
        </div>
        <Button onClick={openCreate} leadingIcon={<Plus size={18} weight="bold" />}>
          New project
        </Button>
      </header>

      <div className="mt-12">
        {isLoading ? (
          <ProjectsSkeleton />
        ) : isError ? (
          <ErrorState message="Could not load your projects. Please try again." />
        ) : !projects || projects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={26} />}
            title="No projects yet"
            description="Create your first project to start organizing tasks into a board."
            action={
              <Button onClick={openCreate} leadingIcon={<Plus size={18} weight="bold" />}>
                New project
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.05}>
                <ProjectCard project={project} onEdit={openEdit} onDelete={setConfirmDelete} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <ProjectFormDialog open={formOpen} onClose={() => setFormOpen(false)} project={editing} />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete project?"
        description={
          confirmDelete
            ? `"${confirmDelete.title}" and all of its tasks will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete project"
        loading={deleteProject.isPending}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteProject.mutateAsync(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
