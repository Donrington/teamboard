import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-control border bg-paper px-3.5 text-sm text-ink placeholder:text-muted/60 ' +
  'transition-[border-color,box-shadow] duration-200 outline-none ' +
  'focus:border-ink/30 focus:ring-4 focus:ring-ink/[0.06] ' +
  'aria-[invalid=true]:border-[#9F2F2D]/50 aria-[invalid=true]:focus:ring-[#9F2F2D]/10';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(CONTROL, 'h-11', className)} {...props} />;
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(CONTROL, 'min-h-[104px] resize-y py-3 leading-relaxed', className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(CONTROL, 'h-11 cursor-pointer pr-9', className)} {...props}>
        {children}
      </select>
    );
  },
);

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + error/hint. Wrapping <label> associates the text with the input. */
export function Field({ label, error, hint, children, className }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-[#9F2F2D]">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
