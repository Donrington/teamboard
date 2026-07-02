import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Trash } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/features/auth/AuthContext';
import { Avatar } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import { Spinner } from '@/components/ui/Spinner';
import { apiErrorMessage } from '@/services/api';
import { useUpdateProfile } from './useProfile';
import { uploadAvatar, isCloudinaryConfigured, CloudinaryNotConfiguredError } from './cloudinary';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';

const nameSchema = z.object({ name: z.string().min(2, 'Enter your name').max(80) });
type NameValues = z.infer<typeof nameSchema>;

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: user?.name ?? '' } });

  const onPickPhoto = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;

    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      await updateProfile.mutateAsync({ avatarUrl });
    } catch (err) {
      if (err instanceof CloudinaryNotConfiguredError) {
        setAvatarError(
          'Photo uploads aren’t set up yet — add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend/.env.',
        );
      } else {
        setAvatarError(apiErrorMessage(err, 'Could not upload your photo.'));
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSaveName = async (values: NameValues) => {
    try {
      await updateProfile.mutateAsync({ name: values.name });
    } catch {
      // surfaced via the shared error state below
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-muted transition hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to projects
      </Link>

      <header className="mt-5">
        <span className="eyebrow">Account</span>
        <h1 className="mt-2.5 font-display text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2.5 text-muted">Manage your profile and account.</p>
      </header>

      {/* Profile photo */}
      <section className="surface mt-10 p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Profile photo</h2>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative">
            <Avatar user={user} className="h-20 w-20 text-base" />
            {avatarUploading && (
              <div className="absolute inset-0 grid place-items-center rounded-full bg-ink/40">
                <Spinner className="h-5 w-5 text-bone" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={onPickPhoto}
              disabled={avatarUploading}
              leadingIcon={<Camera size={16} />}
            >
              Change photo
            </Button>
            <p className="mt-2 text-xs text-muted">PNG, JPEG or WebP.</p>
          </div>
        </div>
        {avatarError && <ErrorState message={avatarError} className="mt-4" />}
        {!isCloudinaryConfigured() && !avatarError && (
          <p className="mt-4 text-xs text-muted">
            Photo uploads use Cloudinary and aren’t configured in this environment yet.
          </p>
        )}
      </section>

      {/* Display name */}
      <section className="surface mt-6 p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Display name</h2>
        <form onSubmit={handleSubmit(onSaveName)} className="mt-4 space-y-4" noValidate>
          {updateProfile.isError && !avatarError && (
            <ErrorState message={apiErrorMessage(updateProfile.error, 'Could not save your name.')} />
          )}
          <Field label="Name" error={errors.name?.message}>
            <Input aria-invalid={!!errors.name} {...register('name')} />
          </Field>
          <Button type="submit" loading={updateProfile.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </form>
      </section>

      {/* Email — read only */}
      <section className="surface mt-6 p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Email</h2>
        <p className="mt-4 text-sm">{user?.email}</p>
        <p className="mt-2 text-xs text-muted">Your email address cannot be changed.</p>
      </section>

      {/* Danger zone */}
      <section className="surface mt-6 border-[#9F2F2D]/20 p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-[#9F2F2D]">Danger zone</h2>
        <p className="mt-2 text-sm text-muted">
          Permanently delete your account and every project and task you own.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => setDeleteOpen(true)}
          leadingIcon={<Trash size={16} />}
        >
          Delete account
        </Button>
      </section>

      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          logout();
          navigate('/');
        }}
      />
    </div>
  );
}
