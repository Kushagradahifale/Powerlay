import Link from "next/link"
import { Layers } from "lucide-react"

const footerSections = [
  {
    title: "About",
    links: [
      { label: "About Powerlay", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Materials",
    links: [
      { label: "PLA", href: "#" },
      { label: "ABS", href: "#" },
      { label: "PETG", href: "#" },
      { label: "Nylon", href: "#" },
      { label: "Resin", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Upload & Print", href: "#" },
      { label: "Bulk Orders", href: "#" },
      { label: "Design Consultation", href: "#" },
      { label: "Enterprise", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Terms & Privacy", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-6 py-12">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Logo & tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">POWERLAY</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Precision 3D printing on demand. Upload your STL and we handle the rest.
            </p>
          </div>

          {/* Footer columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Powerlay. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
