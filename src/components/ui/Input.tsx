import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-content-secondary text-xs uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm',
          'placeholder:text-content-muted',
          'focus:outline-none focus:ring-1 focus:ring-alqia-orange/50 focus:border-alqia-orange/50',
          'transition-all duration-150',
          error && 'border-status-danger/50 focus:ring-status-danger/30',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && <p className="text-status-danger text-xs">{error}</p>}
      {hint && !error && <p className="text-content-muted text-xs">{hint}</p>}
    </div>
  )
}
