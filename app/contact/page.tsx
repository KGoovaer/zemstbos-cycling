import { ContactForm } from '@/components/contact/ContactForm'
import { ContactInfo } from '@/components/contact/ContactInfo'

export const metadata = {
  title: 'Contact - Zemst BOS Cycling Club',
  description: 'Neem contact op met Zemst BOS Cycling Club voor vragen over lidmaatschap en ritten.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Contact
          </h1>
          <p className="text-2xl md:text-3xl text-emerald-50 max-w-2xl mx-auto">
            Vragen? We helpen je graag verder!
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}
