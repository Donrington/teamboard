import type { CreateTaskPayload, Task, UpdateTaskPayload } from '@teamboard/shared';
import { api } from '@/services/api';

/** Typed calls to the nested task endpoints under a project. */
export const tasksApi = {
  list: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`).then((r) => r.data),
  create: (projectId: string, payload: CreateTaskPayload) =>
    api.post<Task>(`/projects/${projectId}/tasks`, payload).then((r) => r.data),
  update: (projectId: string, taskId: string, payload: UpdateTaskPayload) =>
    api.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, payload).then((r) => r.data),
  remove: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`).then(() => taskId),
};
