import { cn } from '@/utils/cn'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-content-secondary text-xs uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm',
          'focus:outline-none focus:ring-1 focus:ring-alqia-orange/50 focus:border-alqia-orange/50',
          'transition-all duration-150',
          error && 'border-status-danger/50',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-bg-dark">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-dark">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-status-danger text-xs">{error}</p>}
    </div>
  )
}
