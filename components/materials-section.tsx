import { Layers, Shield, Zap, Cpu, Gem } from "lucide-react"

const materials = [
  {
    name: "PLA",
    subtitle: "Standard",
    icon: Layers,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    description: "Best for general purpose printing. Easy to work with, biodegradable, and available in many colors.",
    tags: ["General Use", "Eco-Friendly", "Cost-Effective"],
    priceFrom: "₹5/g",
  },
  {
    name: "ABS",
    subtitle: "Durable",
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    description: "Heat-resistant and impact-tough. Ideal for functional parts exposed to stress or temperature.",
    tags: ["Heat Resistant", "Impact Tough", "Post-Processable"],
    priceFrom: "₹7/g",
  },
  {
    name: "PETG",
    subtitle: "Flexible",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    description: "Semi-flexible with excellent layer adhesion. Great for parts needing some give without breaking.",
    tags: ["Flexible", "Food-Safe", "Chemical Resistant"],
    priceFrom: "₹6/g",
  },
  {
    name: "Nylon",
    subtitle: "Industrial",
    icon: Cpu,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    description: "Professional-grade strength and wear resistance. Used in real manufacturing environments.",
    tags: ["High Strength", "Wear Resistant", "Low Friction"],
    priceFrom: "₹10/g",
  },
  {
    name: "Resin",
    subtitle: "High Detail",
    icon: Gem,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    description: "Exceptional surface detail and smooth finish. Perfect for miniatures, jewelry, and dental models.",
    tags: ["Ultra Detail", "Smooth Finish", "Rigid"],
    priceFrom: "₹12/g",
  },
]

export function MaterialsSection() {
  return (
    <section className="bg-secondary/30 py-16 border-y border-border">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
            Materials
          </p>
          <h2 className="text-3xl font-bold text-foreground text-balance">
            The Right Material for Every Job
          </h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Choose from five professional-grade materials, each optimized for different use cases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {materials.map((mat) => {
            const Icon = mat.icon
            return (
              <div
                key={mat.name}
                className={`rounded-xl border ${mat.border} bg-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mat.bg}`}>
                  <Icon className={`h-5 w-5 ${mat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-card-foreground">{mat.name}</p>
                  <p className={`text-xs font-medium ${mat.color}`}>{mat.subtitle}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {mat.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {mat.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className={`text-sm font-semibold ${mat.color}`}>From {mat.priceFrom}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
