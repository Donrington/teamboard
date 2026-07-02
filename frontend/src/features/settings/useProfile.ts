import { useMutation } from '@tanstack/react-query';
import type { UpdateProfilePayload, DeleteAccountPayload } from '@teamboard/shared';
import { usersApi } from './users.api';
import { useAuth } from '@/features/auth/AuthContext';

/** Updates the profile on the server, then merges the result into the auth cache. */
export function useUpdateProfile() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateProfile(payload),
    onSuccess: (user) => updateUser(user),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (payload: DeleteAccountPayload) => usersApi.deleteAccount(payload),
  });
}
