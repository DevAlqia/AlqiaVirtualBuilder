import { GlassPanel } from '@/components/glass/GlassPanel'
import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export function MetricCard({ label, value, icon: Icon, trend, className }: MetricCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <GlassPanel className={cn('p-5 flex flex-col gap-3', className)} animate>
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-alqia-orange/10">
          <Icon className="w-4 h-4 text-alqia-orange" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-status-success' : 'text-status-danger'
            )}
          >
            {isPositive ? '+' : ''}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-questrial font-semibold text-white">{value}</p>
        <p className="text-content-muted text-xs mt-0.5">{label}</p>
      </div>
    </GlassPanel>
  )
}
