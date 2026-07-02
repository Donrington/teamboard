import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TaskStatus, TASK_STATUSES, TASK_STATUS_LABEL, type Task } from '@teamboard/shared';

import { Dialog } from '@/components/ui/Dialog';
import { Field, Input, TextArea, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { apiErrorMessage } from '@/services/api';
import { useCreateTask, useUpdateTask } from '../useTasks';

const schema = z.object({
  title: z.string().min(1, 'Give the task a title').max(160),
  description: z.string().max(4000).optional(),
  status: z.nativeEnum(TaskStatus),
});
type Values = z.infer<typeof schema>;

export function TaskFormDialog({
  open,
  onClose,
  projectId,
  task,
  defaultStatus = TaskStatus.Todo,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null;
  defaultStatus?: TaskStatus;
}) {
  const isEdit = Boolean(task);
  const create = useCreateTask(projectId);
  const update = useUpdateTask(projectId);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', status: defaultStatus },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? defaultStatus,
      });
      setFormError(null);
    }
  }, [open, task, defaultStatus, reset]);

  const submitting = create.isPending || update.isPending;

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      if (isEdit && task) {
        await update.mutateAsync({ taskId: task.id, payload: values });
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
      title={isEdit ? 'Edit task' : 'New task'}
      description={isEdit ? 'Update this task.' : 'Tasks track a single piece of work in a project.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <ErrorState message={formError} />}
        <Field label="Title" error={errors.title?.message}>
          <Input autoFocus placeholder="Draft the homepage copy" aria-invalid={!!errors.title} {...register('title')} />
        </Field>
        <Field label="Description" error={errors.description?.message} hint="Optional.">
          <TextArea placeholder="Any detail worth remembering." {...register('description')} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register('status')}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
