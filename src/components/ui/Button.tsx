import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-questrial font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-ultra disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:
      'bg-alqia-orange text-white hover:bg-alqia-orange/90 active:bg-alqia-orange/80 focus:ring-alqia-orange/50',
    secondary:
      'glass text-white hover:bg-white/[0.14] focus:ring-white/20',
    ghost:
      'text-content-secondary hover:bg-white/[0.06] hover:text-white focus:ring-white/10',
    danger:
      'bg-status-danger/10 text-status-danger border border-status-danger/30 hover:bg-status-danger/20 focus:ring-status-danger/30',
    outline:
      'border border-white/20 text-white hover:bg-white/[0.06] focus:ring-white/20',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-9',
    lg: 'px-5 py-2.5 text-base h-10',
    icon: 'p-2 h-8 w-8',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
    </button>
  )
}
