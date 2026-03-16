export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t-4 border-black bg-black text-white">
      <div className="mx-auto max-w-6xl px-6">

        {/* Top section */}
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 py-16 sm:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-white">
                <span className="text-sm font-black text-white">P</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Portfolio
              </span>
            </div>
            <p className="text-xs leading-relaxed text-white/50" style={{ maxWidth: '240px' }}>
              Designed with precision. Built with purpose. In the tradition of the International Typographic Style.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF3000]">
              Navigation
            </span>
            {['About', 'Skills', 'Projects', 'CV', 'Contact'].map((label, i) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/60 transition-colors duration-150 hover:text-[#FF3000]"
              >
                <span className="text-white/30 transition-colors duration-150 group-hover:text-[#FF3000]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF3000]">
              Connect
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium uppercase tracking-widest text-white/60 transition-colors duration-150 hover:text-white"
            >
              GitHub ↗
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium uppercase tracking-widest text-white/60 transition-colors duration-150 hover:text-white"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <p className="text-xs font-medium uppercase tracking-widest text-white/30">
            © {year} All Rights Reserved
          </p>
          <p className="text-xs font-medium uppercase tracking-widest text-white/30">
            Swiss International Style
          </p>
        </div>
      </div>
    </footer>
  )
}
