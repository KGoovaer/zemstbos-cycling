import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  subtitle?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  icon,
  subtitle,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-800 text-lg font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-700">{subtitle}</p>}
        </div>
        {icon && (
          <div className="ml-4 text-blue-600 opacity-80">{icon}</div>
        )}
      </div>
    </div>
  )
}
