import { ReactNode } from "react";

type HowStepProps = {
  index: number;
  title: string;
  description: string;
  icon: ReactNode;
};

export default function HowStep({
  index,
  title,
  description,
  icon,
}: HowStepProps) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/7">
      <div className="flex items-start gap-4">
        <div className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100">
          {icon}
        </div>

        <div>
          <div className="text-xs font-medium tracking-wider text-slate-300/80">
            STEP {String(index).padStart(2, "0")}
          </div>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

