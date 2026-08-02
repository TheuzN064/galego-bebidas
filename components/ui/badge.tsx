import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        {
          'bg-primary text-black font-bold shadow-sm': variant === 'default',
          'bg-zinc-800 text-dark-text border border-zinc-700': variant === 'secondary',
          'bg-red-500/20 text-red-400 border border-red-500/30': variant === 'destructive',
          'border border-dark-border text-dark-text bg-dark-bg/60': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
