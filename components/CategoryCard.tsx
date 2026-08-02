import { Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  isActive?: boolean
  onClick: () => void
}

export function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 active:scale-95',
        isActive
          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(132,204,22,0.15)] ring-1 ring-primary/40'
          : 'border-dark-border bg-dark-card hover:border-primary/50 hover:bg-zinc-900/60'
      )}
    >
      <span className="text-3xl transition-transform duration-200 group-hover:scale-110">{category.icon}</span>
      <span
        className={cn(
          'font-manrope text-sm font-semibold transition-colors',
          isActive ? 'text-primary' : 'text-dark-text group-hover:text-primary-light'
        )}
      >
        {category.name}
      </span>
    </button>
  )
}
