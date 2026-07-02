import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Project } from '@teamboard/shared';

import { Dialog } from '@/components/ui/Dialog';
import { Field, Input, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { apiErrorMessage } from '@/services/api';
import { useCreateProject, useUpdateProject } from '../useProjects';

const schema = z.object({
  title: z.string().min(1, 'Give the project a title').max(120),
  description: z.string().max(2000).optional(),
});
type Values = z.infer<typeof schema>;

/** Create or edit a project — one dialog, driven by whether `project` is passed. */
export function ProjectFormDialog({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}) {
  const isEdit = Boolean(project);
  const create = useCreateProject();
  const update = useUpdateProject();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: '', description: '' } });

  useEffect(() => {
    if (open) {
      reset({ title: project?.title ?? '', description: project?.description ?? '' });
      setFormError(null);
    }
  }, [open, project, reset]);

  const submitting = create.isPending || update.isPending;

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      if (isEdit && project) {
        await update.mutateAsync({ id: project.id, payload: values });
      } else {
        await create.mutateAsync(values);
      }
      onClose();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'New project'}
      description={isEdit ? 'Update this project’s details.' : 'Projects group related tasks together.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <ErrorState message={formError} />}
        <Field label="Title" error={errors.title?.message}>
          <Input autoFocus placeholder="Website relaunch" aria-invalid={!!errors.title} {...register('title')} />
        </Field>
        <Field label="Description" error={errors.description?.message} hint="Optional.">
          <TextArea placeholder="A short note on what this project is about." {...register('description')} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
