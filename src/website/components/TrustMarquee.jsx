import { TRUST_ITEMS } from '../content'

export default function TrustMarquee() {
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS]

  return (
    <section className="landing-glass-strip w-full overflow-hidden py-10">
      <p className="landing-wrap mb-8 text-center text-xs font-extrabold uppercase tracking-[0.22em] landing-text-muted">
        Full LMS + institutional platform
      </p>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--lp-bg)] to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--lp-bg)] to-transparent sm:w-32" />
        <div className="landing-marquee gap-6">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="landing-pill mx-2 inline-flex items-center gap-2.5 whitespace-nowrap px-7 py-3 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#00c2ff]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
