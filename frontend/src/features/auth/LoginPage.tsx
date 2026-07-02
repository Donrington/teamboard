import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from '@phosphor-icons/react';

import { useAuth } from './AuthContext';
import { AuthLayout } from './AuthLayout';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { apiErrorMessage } from '@/services/api';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (status === 'authenticated') {
    return <Navigate to="/projects" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from ?? '/projects';

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not sign you in.'));
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Pick up exactly where your team left off."
      points={[
        'Every project and task, scoped to your account and no one else’s.',
        'A calm, document-style board built for focus, not noise.',
        'Your session is signed with a JWT and restored on return.',
      ]}
    >
      <div className="mb-8">
        <span className="eyebrow">Sign in</span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Sign in to TeamBoard
        </h1>
        <p className="mt-2 text-sm text-muted">
          New here?{' '}
          <Link to="/signup" className="font-medium text-verdigris underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <ErrorState message={formError} />}

        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
          trailingIcon={<ArrowRight size={18} />}
        >
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
