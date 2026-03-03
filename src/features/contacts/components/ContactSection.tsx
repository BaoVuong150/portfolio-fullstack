import { ContactForm } from './ContactForm'

export function ContactSection() {
  return (
    <section id="contact">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Heading */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Contact
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Have a project in mind? Let&apos;s talk.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          {/* Left: info */}
          <div className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-gray-500">
              I&apos;m always open to discussing new projects, creative ideas,
              or opportunities to be part of your vision. Fill out the form and
              I&apos;ll get back to you as soon as possible.
            </p>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Response time
              </p>
              <p className="text-sm text-gray-600">Usually within 24 hours</p>
            </div>
          </div>

          {/* Right: form */}
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
