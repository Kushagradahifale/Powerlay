import { ReactNode } from "react";

type ServiceCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export default function ServiceCard({
  title,
  description,
  icon,
}: ServiceCardProps) {
  return (
    <div
      className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/7"
      role="article"
      aria-label={title}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100">
          {icon}
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {description}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -inset-1 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
      </div>
    </div>
  );
}

