import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
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
  name: z.string().min(2, 'Your name is required').max(80),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters').max(72),
});
type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { status, signup } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (status === 'authenticated') {
    return <Navigate to="/projects" replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await signup(values);
      navigate('/projects', { replace: true });
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create your account.'));
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      heading="Organize the work before it organizes you."
      points={[
        'Group work into projects, break projects into tasks.',
        'Move tasks across To Do, In Progress, and Done in one click.',
        'No setup, no clutter — an account and you’re in.',
      ]}
    >
      <div className="mb-8">
        <span className="eyebrow">Create account</span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Create your TeamBoard
        </h1>
        <p className="mt-2 text-sm text-muted">
          Already have one?{' '}
          <Link to="/login" className="font-medium text-verdigris underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <ErrorState message={formError} />}

        <Field label="Full name" error={errors.name?.message}>
          <Input
            type="text"
            autoComplete="name"
            placeholder="Carrington Abakwe"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field label="Password" error={errors.password?.message} hint="Minimum 8 characters.">
          <Input
            type="password"
            autoComplete="new-password"
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
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
