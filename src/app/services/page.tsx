import Link from "next/link";

export default function ServicesPage() {
  return (
    <section className="py-4">
      <div className="rounded-3xl border border-black/5 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/30 sm:p-8">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Services
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-slate-600 dark:text-slate-300">
          A calm set of building blocks for your SaaS: reliable data, fast workflows, and a
          dashboard that stays out of your way.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Dashboard UI",
              desc: "Apple-style components with consistent spacing and type.",
            },
            {
              title: "Service Layer",
              desc: "Composable patterns for clean APIs and predictable state.",
            },
            { title: "Deploy Ready", desc: "Production-friendly defaults for Next.js." },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-black/5 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5"
            >
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Preview dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-slate-200/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-white transition dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

