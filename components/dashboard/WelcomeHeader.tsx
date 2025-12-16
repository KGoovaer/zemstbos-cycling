interface WelcomeHeaderProps {
  name: string | null | undefined
}

export function WelcomeHeader({ name }: WelcomeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-10 shadow-lg">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Welkom, {name}!
        </h1>
        <p className="text-xl md:text-2xl text-emerald-50">
          Klaar voor je volgende rit?
        </p>
      </div>
    </div>
  )
}
