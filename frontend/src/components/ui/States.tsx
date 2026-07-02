import type { ReactNode } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

/** Centered full-viewport loader (used while auth/session resolves). */
export function FullScreenLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="h-6 w-6 text-verdigris" />
      <span className="eyebrow">{label}</span>
    </div>
  );
}

/** Empty state — icon, headline, supporting line, optional action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'surface flex flex-col items-center justify-center gap-4 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-card bg-fog text-verdigris">
        {icon}
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Inline error panel for failed queries. */
export function ErrorState({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card border border-[#9F2F2D]/25 bg-[#FDEBEC] px-4 py-3 text-sm text-[#9F2F2D]',
        className,
      )}
    >
      <WarningCircle size={18} weight="fill" className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
