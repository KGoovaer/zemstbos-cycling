import Link from 'next/link'

export function QuickLinks() {
  const links = [
    {
      href: '/calendar',
      label: 'Kalender',
      icon: '📅',
      description: 'Bekijk alle ritten'
    },
    {
      href: '/profile',
      label: 'Profiel',
      icon: '👤',
      description: 'Mijn gegevens'
    },
    {
      href: '/events',
      label: 'Evenementen',
      icon: '🎉',
      description: 'Club activiteiten'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Snelle Links</h2>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-300"
          >
            <div className="flex items-center">
              <span className="text-3xl mr-3">{link.icon}</span>
              <div>
                <p className="text-lg font-semibold text-gray-900">{link.label}</p>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
