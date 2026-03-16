import { ContactForm } from './ContactForm'

export function ContactSection() {
  return (
    <section id="contact" className="border-b-4 border-black">
      <div className="mx-auto max-w-6xl px-6">

        {/* Section header */}
        <div className="border-b border-black/10 py-6">
          <span className="swiss-section-number">05. Contact</span>
        </div>

        <div className="py-16 lg:py-24">
          {/* Heading */}
          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="swiss-heading text-5xl text-black sm:text-7xl lg:text-8xl">
                Get in<br />
                <span className="text-[#FF3000]">Touch</span>
              </h2>
            </div>
            <div className="flex items-end lg:col-span-5">
              <p className="max-w-sm text-sm leading-relaxed text-[#666]">
                Have a project in mind? Let&apos;s collaborate.
                I&apos;m always open to discussing new ideas and opportunities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left: info panel */}
            <div className="flex flex-col gap-8 lg:col-span-5">
              <div className="border-2 border-black bg-[#F2F2F2] p-8 swiss-dots">
                <p className="text-sm leading-relaxed text-[#666]">
                  I&apos;m always open to discussing new projects, creative ideas,
                  or opportunities to be part of your vision. Fill out the form and
                  I&apos;ll get back to you as soon as possible.
                </p>
              </div>

              <div className="border-2 border-black p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-[#FF3000]" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                      Response Time
                    </span>
                  </div>
                  <p className="text-3xl font-black text-black">24h</p>
                  <p className="text-xs font-medium text-[#999]">
                    Usually within 24 hours
                  </p>
                </div>
              </div>

              {/* Geometric accent */}
              <div className="relative hidden h-24 lg:block">
                <div className="absolute left-0 top-0 h-16 w-16 border-4 border-black" />
                <div className="absolute left-8 top-8 h-16 w-16 bg-[#FF3000]" />
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
