interface WelcomeHeaderProps {
  name: string | null | undefined
}

export function WelcomeHeader({ name }: WelcomeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">
          Welkom, {name}!
        </h1>
        <p className="text-xl text-blue-100">
          Klaar voor je volgende rit?
        </p>
      </div>
    </div>
  )
}
