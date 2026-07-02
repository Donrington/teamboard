import type { DeleteAccountPayload, UpdateProfilePayload, UserPublic } from '@teamboard/shared';
import { api } from '@/services/api';

export const usersApi = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<UserPublic>('/users/me', payload).then((r) => r.data),
  deleteAccount: (payload: DeleteAccountPayload) => api.delete('/users/me', { data: payload }),
};
