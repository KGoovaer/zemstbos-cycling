import Link from 'next/link'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: string
}

const actions: QuickAction[] = [
  {
    title: 'Beheer Schema',
    description: 'Voeg ritten toe, bewerk of verwijder geplande ritten',
    href: '/admin/schedule',
    icon: '📅',
  },
  {
    title: 'Beheer Seizoenen',
    description: 'Maak seizoenen aan en activeer het huidige seizoen',
    href: '/admin/seasons',
    icon: '🗓️',
  },
  {
    title: 'Beheer Leden',
    description: 'Bekijk en beheer club leden en betalingen',
    href: '/admin/members',
    icon: '👥',
  },
  {
    title: 'Beheer Routes',
    description: 'Upload GPX bestanden en beheer route bibliotheek',
    href: '/admin/routes',
    icon: '🗺️',
  },
  {
    title: 'Beheer Evenementen',
    description: 'Maak en beheer club evenementen en sociale activiteiten',
    href: '/admin/events',
    icon: '🎉',
  },
  {
    title: 'Route Suggesties',
    description: 'Bekijk aanbevolen routes voor aankomende ritten',
    href: '/admin/suggestions',
    icon: '💡',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
        >
          <div className="flex items-start">
            <span className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-200">
              {action.icon}
            </span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-gray-600 text-lg">{action.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
