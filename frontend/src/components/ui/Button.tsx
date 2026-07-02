import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Fully-rounded "island" pill — used for hero CTAs. */
  pill?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-bone hover:bg-slate',
  secondary: 'bg-bone text-ink border border-line hover:bg-paper',
  accent: 'bg-verdigris text-bone hover:brightness-[0.94]',
  ghost: 'text-ink hover:bg-ink/[0.06]',
  danger: 'text-[#9F2F2D] hover:bg-[#9F2F2D]/[0.08]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
};

/**
 * The one button in the system. Editorial radius by default (not a pill); solid ink
 * primary; custom easing; physical `active:scale` press. Motion stays on transform +
 * colour only (design-skill performance guardrails).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    pill = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'group inline-flex select-none items-center justify-center gap-2 font-medium',
        'transition-[transform,background-color,color,filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-fog',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        pill ? 'rounded-full' : 'rounded-control',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : leadingIcon}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  );
});
