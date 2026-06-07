import { cn } from '@/utils/cn'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  return (
    <div className={cn('relative group inline-flex', className)}>
      {children}
      <span
        className={cn(
          'absolute z-50 px-2 py-1 text-xs text-white bg-bg-dark border border-white/10 rounded-md whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none',
          positions[position]
        )}
      >
        {content}
      </span>
    </div>
  )
}
