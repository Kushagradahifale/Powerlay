import Image from "next/image"

const prints = [
  { title: "Phone Stand", img: "/images/print-phone-stand.jpg", material: "PLA" },
  { title: "Mechanical Gears", img: "/images/print-gears.jpg", material: "ABS" },
  { title: "Engineering Prototype", img: "/images/print-prototype.jpg", material: "ABS" },
  { title: "Electronics Enclosure", img: "/images/print-enclosure.jpg", material: "PETG" },
  { title: "Detailed Miniature", img: "/images/print-miniature.jpg", material: "Resin" },
  { title: "Structural Bracket", img: "/images/print-bracket.jpg", material: "Nylon" },
]

export function ExamplePrints() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
            Example Prints
          </p>
          <h2 className="text-3xl font-bold text-foreground text-balance">
            From File to Finished Part
          </h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Real products shipped to customers — every one started as an STL.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {prints.map((print) => (
            <div
              key={print.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <Image
                  src={print.img}
                  alt={print.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-card-foreground">{print.title}</p>
                <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {print.material}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
