import { cn } from '@/lib/cn';

/**
 * The TeamBoard icon — a drafting/ledger badge holding three bars (verdigris, brass,
 * bone), lifted straight from brand_identity/TeamBoard-Icon-Mark.svg. The badge uses
 * `currentColor` so it can render in ink or bone depending on its surroundings.
 */
export function IconMark({ className, title = 'TeamBoard' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('text-ink', className)}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 40,20 L 144,20 L 180,56 L 180,160 Q 180,180 160,180 L 40,180 Q 20,180 20,160 L 20,40 Q 20,20 40,20 Z"
        fill="currentColor"
      />
      <rect x="58" y="95" width="20" height="60" rx="3" fill="#4C8577" />
      <rect x="90" y="65" width="20" height="90" rx="3" fill="#B4915B" />
      <rect x="122" y="115" width="20" height="40" rx="3" fill="#F0EEE6" />
    </svg>
  );
}
