import { Upload, Settings2, Printer, Truck } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload STL",
    description: "Drag and drop your STL file or click to browse. We accept any valid STL geometry.",
  },
  {
    step: "02",
    icon: Settings2,
    title: "Choose Material & Infill",
    description: "Select from PLA, ABS, PETG, Nylon, or Resin. Set your infill density from 10–100%.",
  },
  {
    step: "03",
    icon: Printer,
    title: "We Print",
    description: "Our fleet of industrial printers handles your job with precision quality checks at each stage.",
  },
  {
    step: "04",
    icon: Truck,
    title: "We Deliver",
    description: "Parts are inspected, packaged, and shipped directly to your door. Tracking included.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
            How It Works
          </p>
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Four Steps to Your Part
          </h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            From digital file to physical product in as little as 3 business days.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">{step.step}</p>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
