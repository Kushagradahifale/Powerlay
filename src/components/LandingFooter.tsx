import Link from "next/link";

const footerSections = [
  {
    title: "About Powerlay",
    links: [
      { label: "About Us", href: "/" },
      { label: "How It Works", href: "/" },
      { label: "Materials Guide", href: "/" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "3D Printing", href: "/services" },
      { label: "Prototyping", href: "/services" },
      { label: "Bulk Orders", href: "/services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Order Tracking", href: "/orders" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Orders", href: "/orders" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title} className="min-w-0">
              <h2 className="text-sm font-semibold tracking-wide text-white">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-lg font-extrabold tracking-[0.2em] text-white">
            POWERLAY
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400"
              />
              <span>Country</span>
              <select
                aria-label="Country selector"
                defaultValue="IN"
                className="bg-transparent text-sm text-white outline-none"
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Powerlay. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

