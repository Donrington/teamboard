import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <Link to="/" className="mb-10">
        <Logo />
      </Link>
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-4 font-display text-6xl font-semibold tracking-tight sm:text-7xl">
        Off the board.
      </h1>
      <p className="mt-4 max-w-sm text-pretty text-muted">
        This page isn’t on any of your projects. Let’s get you back to somewhere useful.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button variant="secondary" leadingIcon={<ArrowLeft size={18} />}>
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
