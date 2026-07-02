import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Dialog } from '@/components/ui/Dialog';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { apiErrorMessage } from '@/services/api';
import { useDeleteAccount } from '../useProfile';

const schema = z.object({ password: z.string().min(1, 'Enter your password to confirm') });
type Values = z.infer<typeof schema>;

/**
 * Requires the current password before deleting the account — a destructive action
 * that also cascades every project and task the user owns (docs/07-settings).
 */
export function DeleteAccountDialog({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const deleteAccount = useDeleteAccount();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const close = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values: Values) => {
    setFormError(null);
    try {
      await deleteAccount.mutateAsync(values);
      onDeleted();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not delete your account.'));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Delete your account?"
      description="This permanently deletes your account and every project and task you own. This cannot be undone."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <ErrorState message={formError} />}
        <Field label="Confirm your password" error={errors.password?.message}>
          <Input
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={close} disabled={deleteAccount.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={deleteAccount.isPending}
            className="bg-[#9F2F2D] text-bone hover:bg-[#872624]"
          >
            Delete my account
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
