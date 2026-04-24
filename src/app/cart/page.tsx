import Link from "next/link";

export default function CartPage() {
  const cartItems = [
    { sku: "PL-DEV-01", name: "Developer Seats", price: 29, qty: 1 },
    { sku: "PL-OPS-02", name: "Ops Monitoring", price: 49, qty: 1 },
    { sku: "PL-EXP-03", name: "Exports Bundle", price: 19, qty: 1 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const estimatedTax = Math.round(subtotal * 0.07 * 100) / 100;
  const total = subtotal + estimatedTax;

  return (
    <section className="py-4">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-white backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Cart
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-200/80">
              Commerce UI placeholder. Totals are static and meant to support the
              navbar experience.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition"
          >
            Continue shopping
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.sku}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-200/70">{item.sku}</div>
                </div>

                <div className="text-sm text-slate-200/80">
                  Qty {item.qty} · ${item.price}/mo
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-200/80">Order summary</div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-200/70">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-200/70">Estimated tax</span>
                <span className="font-medium">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-slate-200/80">Total</span>
                <span className="text-base font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition"
            >
              Checkout
            </button>
            <div className="mt-3 text-xs text-slate-200/60">
              Payment is not implemented (UI only).
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

