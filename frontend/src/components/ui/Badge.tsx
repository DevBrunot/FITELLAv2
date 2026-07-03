import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-secondary/15 text-secondary',
    warning: 'bg-accent text-accent-foreground',
    danger: 'bg-destructive/10 text-destructive',
    info: 'bg-muted text-muted-foreground',
    purple: 'bg-accent text-accent-foreground',
  }
  return <span className={cn('badge', variants[variant], className)} {...props} />
}
