import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  heading: string;
  points: string[];
}

/**
 * Editorial split screen for auth (docs/06): an ink brand panel on the left with
 * drifting patina light, the form on the right. Below `lg` the brand panel drops away
 * and the form takes the full width.
 */
export function AuthLayout({ children, eyebrow, heading, points }: AuthLayoutProps) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink px-12 py-14 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-verdigris/25 blur-3xl animate-drift" />
        <div
          className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-brass/20 blur-3xl animate-drift"
          style={{ animationDelay: '-9s' }}
        />

        <Link to="/" className="relative w-max">
          <Logo tone="bone" showTagline />
        </Link>

        <div className="relative max-w-md">
          <span className="eyebrow text-bone/50">{eyebrow}</span>
          <h2 className="mt-4 text-balance font-display text-[2.6rem] font-semibold leading-[1.05] text-bone">
            {heading}
          </h2>
          <ul className="mt-10 space-y-5">
            {points.map((point, i) => (
              <li key={point} className="flex gap-4">
                <span className="mt-0.5 font-mono text-xs text-brass">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-relaxed text-bone/70">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[11px] text-bone/40">
          TeamBoard — internal work management
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
