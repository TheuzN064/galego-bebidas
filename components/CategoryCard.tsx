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
        'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-primary',
        isActive ? 'border-primary bg-primary/10' : 'border-dark-border bg-dark-card'
      )}
    >
      <span className="text-3xl">{category.icon}</span>
      <span className="font-manrope text-sm font-medium text-dark-text">
        {category.name}
      </span>
    </button>
  )
}
