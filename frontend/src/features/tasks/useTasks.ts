import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '@teamboard/shared';
import { tasksApi } from './tasks.api';
import { projectKeys } from '../projects/useProjects';

export const taskKeys = {
  list: (projectId: string) => ['tasks', projectId] as const,
};

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.list(projectId),
    queryFn: () => tasksApi.list(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list(projectId) });
      qc.invalidateQueries({ queryKey: projectKeys.all }); // keep taskCount fresh
    },
  });
}

/**
 * Update a task. Status moves are applied **optimistically** so a card jumps to its
 * new column instantly; if the request fails we roll back to the previous list
 * (docs/07). This is what makes the board feel immediate.
 */
export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { taskId: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(projectId, vars.taskId, vars.payload),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: taskKeys.list(projectId) });
      const previous = qc.getQueryData<Task[]>(taskKeys.list(projectId));
      if (previous) {
        qc.setQueryData<Task[]>(
          taskKeys.list(projectId),
          previous.map((t) => (t.id === vars.taskId ? { ...t, ...vars.payload } : t)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(taskKeys.list(projectId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.list(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(projectId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list(projectId) });
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
