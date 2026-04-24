import { Target, Sliders, Clock } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Precision",
    description:
      "Layer tolerances down to 0.05mm. Every part is dimensionally accurate to spec, with consistent quality across your entire order.",
    stat: "±0.05mm",
    statLabel: "Layer Tolerance",
  },
  {
    icon: Sliders,
    title: "Customization",
    description:
      "Configure material, infill density, wall thickness, and quantity — all from your browser. You get exactly what you design.",
    stat: "100%",
    statLabel: "Configurable",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description:
      "Standard orders ship in 3–5 business days. Rush processing available for time-critical production runs.",
    stat: "3–5 days",
    statLabel: "Standard Delivery",
  },
]

export function WhyChoose() {
  return (
    <section className="bg-secondary/30 border-y border-border py-16">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
            Why Powerlay
          </p>
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Built for Makers and Engineers
          </h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            We operate like a professional manufacturing partner, not a hobby service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="rounded-xl border border-border bg-card p-8 flex flex-col gap-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{feat.stat}</p>
                    <p className="text-xs text-muted-foreground">{feat.statLabel}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
