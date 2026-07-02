import { cn } from '@/lib/cn';
import { IconMark } from './IconMark';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  /** Colour of the wordmark + icon badge. */
  tone?: 'ink' | 'bone';
}

/** Icon + "TeamBoard" wordmark (Fraunces), optionally with the "Work, Organized" tag. */
export function Logo({ className, showTagline = false, tone = 'ink' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <IconMark className={cn('h-8 w-8 shrink-0', tone === 'bone' ? 'text-bone' : 'text-ink')} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[1.35rem] font-semibold tracking-tight',
            tone === 'bone' ? 'text-bone' : 'text-ink',
          )}
        >
          TeamBoard
        </span>
        {showTagline && <span className="eyebrow mt-1.5">Work, Organized</span>}
      </span>
    </span>
  );
}
