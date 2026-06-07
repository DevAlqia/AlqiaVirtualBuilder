import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'orange'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/70',
  success: 'bg-status-success/10 text-status-success border border-status-success/20',
  warning: 'bg-status-warning/10 text-status-warning border border-status-warning/20',
  danger: 'bg-status-danger/10 text-status-danger border border-status-danger/20',
  info: 'bg-status-info/10 text-status-info border border-status-info/20',
  orange: 'bg-alqia-orange/10 text-alqia-orange border border-alqia-orange/20',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
