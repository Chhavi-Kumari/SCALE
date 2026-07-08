const footerLinks = ["Contact"];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-parchment/45">
      <div className="section-shell flex flex-col gap-6 py-8 text-sm text-stone-600 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="font-display text-xl text-cardinal">USC Viterbi</p>
          <p>USC Viterbi K-12 STEM Center</p>
          <p>© 2026 SCALE. All rights reserved.</p>
        </div>

        <nav aria-label="Footer links" className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <a key={link} href="https://viterbik12.usc.edu/contact/" className="transition hover:text-cardinal">
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
