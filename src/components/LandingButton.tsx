import Link from "next/link";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type LandingButtonProps = {
  href: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
};

export default function LandingButton({
  href,
  variant,
  children,
  className,
}: LandingButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20";

  const variantClass =
    variant === "primary"
      ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15 hover:ring-white/25"
      : "bg-transparent text-slate-200 ring-1 ring-white/15 hover:bg-white/5 hover:text-white";

  return (
    <Link href={href} className={cx(base, variantClass, className)}>
      {children}
    </Link>
  );
}

