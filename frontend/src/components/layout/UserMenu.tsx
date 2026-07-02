import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GearSix, SignOut, SquaresFour } from '@phosphor-icons/react';
import type { UserPublic } from '@teamboard/shared';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Avatar circle — the user's uploaded photo if present, else their initials. */
export function Avatar({ user, className }: { user: UserPublic | null; className?: string }) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={cn('h-9 w-9 shrink-0 rounded-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate font-mono text-[11px] text-bone',
        className,
      )}
    >
      {user ? initials(user.name) : '··'}
    </div>
  );
}

/**
 * Avatar button that opens a small dropdown with the user's identity, a link to
 * Dashboard (their projects), Settings, and Sign out. Works identically at every
 * breakpoint — no separate "hidden on mobile" button is needed, which is what was
 * hiding sign-out (and, on the homepage, the dashboard link) on phones.
 */
export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="rounded-full transition-transform duration-200 active:scale-95"
      >
        <Avatar user={user} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="surface absolute right-0 top-full mt-2 w-64 bg-bone p-1.5 shadow-lift"
          >
            <div className="px-3 py-2.5">
              <div className="truncate text-sm font-medium leading-tight">{user?.name}</div>
              <div className="truncate font-mono text-[11px] text-muted">{user?.email}</div>
            </div>
            <div className="my-1 h-px bg-line" />
            <Link
              to="/projects"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition hover:bg-ink/5"
            >
              <SquaresFour size={17} />
              Dashboard
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition hover:bg-ink/5"
            >
              <GearSix size={17} />
              Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-sm text-[#9F2F2D] transition hover:bg-[#9F2F2D]/[0.08]"
            >
              <SignOut size={17} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
