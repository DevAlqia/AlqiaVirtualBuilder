import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'react'

type GlassVariant = 'default' | 'active' | 'floating'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant
  animate?: boolean
  rounded?: 'md' | 'lg' | 'xl' | '2xl'
}

const variantClasses: Record<GlassVariant, string> = {
  default: 'glass',
  active: 'glass-active',
  floating: 'glass-floating',
}

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
}

export function GlassPanel({
  variant = 'default',
  animate = false,
  rounded = 'xl',
  className,
  children,
  ...props
}: GlassPanelProps) {
  const classes = cn(variantClasses[variant], roundedClasses[rounded], className)

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className={classes}
        {...(props as object)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
