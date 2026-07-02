import type { CreateProjectPayload, Project, UpdateProjectPayload } from '@teamboard/shared';
import { api } from '@/services/api';

/** Typed calls to the projects endpoints. Response shapes come from @teamboard/shared. */
export const projectsApi = {
  list: () => api.get<Project[]>('/projects').then((r) => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (payload: CreateProjectPayload) =>
    api.post<Project>('/projects', payload).then((r) => r.data),
  update: (id: string, payload: UpdateProjectPayload) =>
    api.patch<Project>(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`).then(() => id),
};
