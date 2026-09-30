const FEATURES = [
  "Verified with your DU student email",
  "Buy and sell within your own hall",
  "No middlemen, no fees",
];

export default function AuthCard({ title, subtitle, children, maxWidthClass = "max-w-md" }) {
  return (
    <div className="min-h-screen bg-[#faf9f7] lg:flex">
      {/* Brand panel — desktop only. A warm near-black (not cool zinc-950)
          so it shares the same color temperature as the off-white form
          panel instead of reading as two unrelated palettes. */}
      <div className="relative hidden overflow-hidden bg-[#191712] lg:flex lg:w-[42%] lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 10%, rgba(24,168,122,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(24,168,122,0.25), transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* Feathers the panel's own right edge into the form panel's color,
            so the two sides blend at the seam instead of meeting as a hard,
            unrelated line. */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24"
          style={{ background: "linear-gradient(to right, transparent 55%, #faf9f7 100%)" }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
            D
          </span>
          <span className="text-xl font-bold tracking-tight text-white">DUMarket</span>
        </div>

        <div className="relative">
          <h2 className="max-w-[18rem] text-3xl font-bold leading-tight tracking-tight text-white">
            The campus marketplace, built for DU students.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-500">© {new Date().getFullYear()} DUMarket</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-[#faf9f7] px-4 py-10 sm:items-center sm:px-6 lg:py-16">
        <div className={`w-full ${maxWidthClass}`}>
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">
              D
            </span>
            <span className="text-lg font-bold tracking-tight text-zinc-900">DUMarket</span>
          </div>

          <div className="card p-6 sm:p-8">
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
