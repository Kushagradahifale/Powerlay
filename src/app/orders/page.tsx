"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Package,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  Home,
  LayoutDashboard,
  Upload,
  ListOrdered,
  Search,
  User
} from "lucide-react";

const STEP_ORDER = ["confirmed", "queued", "printing", "quality_check", "shipped", "delivered"] as const;

const STEP_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  queued: {
    label: "Queued",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  printing: {
    label: "Printing",
    icon: Printer,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
  quality_check: {
    label: "Quality Check",
    icon: Search,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  delivered: {
    label: "Delivered",
    icon: Package,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
};

function statusEmoji(status: string) {
  switch (status) {
    case "pending": return "🟡";
    case "confirmed": return "🔵";
    case "queued": return "⏳";
    case "printing": return "🟣";
    case "quality_check": return "🔍";
    case "shipped": return "🟠";
    case "delivered": return "🟢";
    case "cancelled": return "🔴";
    default: return "⚪";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "queued": return "bg-orange-100 text-orange-800 border-orange-200";
    case "printing": return "bg-violet-100 text-violet-800 border-violet-200";
    case "quality_check": return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "shipped": return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function ProgressStepper({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STEP_ORDER.indexOf(currentStatus as any);
  if (currentStatus === "pending" || currentStatus === "cancelled") return null;

  return (
    <div className="mt-6 pt-5 border-t border-slate-100 overflow-x-auto pb-4">
      <div className="flex items-center justify-between gap-1 min-w-[600px]">
        {STEP_ORDER.map((step, i) => {
          const meta = STEP_META[step];
          const Icon = meta.icon;
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 min-w-[70px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                    ? isCurrent
                      ? `${meta.bg} ring-2 ring-offset-2 ring-current ${meta.color} shadow-md`
                      : `${meta.bg} ${meta.color}`
                    : "bg-slate-100 text-slate-400"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-bold text-center leading-tight ${isCompleted ? "text-[#0F172A]" : "text-slate-400"
                    }`}
                >
                  {meta.label}
                </span>
              </div>

              {i < STEP_ORDER.length - 1 && (
                <div className="flex-1 mx-1 mt-[-24px]">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${i < currentIdx
                      ? "bg-gradient-to-r from-violet-500 to-blue-500"
                      : "bg-slate-200"
                      }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-24 text-[#1E293B]">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* FLOATING NAVBAR */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_25px_rgba(124,58,237,0.25)] group-hover:scale-105">
              <img
                src="/logo-icon.png"
                alt="Powerlay"
                className="h-6 md:h-7 w-auto object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A] group-hover:text-[#7C3AED] transition-colors duration-300">
              POWERLAY
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link href="/upload" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Upload
            </Link>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 text-slate-900 text-sm font-bold px-4 py-2 rounded-xl">
            <ListOrdered className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pt-32 px-6 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-blue-800 tracking-wide uppercase">
              Order Tracking
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-3 tracking-tight">
            Your Orders
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Track your 3D prints in real time — from confirmation to delivery.
          </p>
        </div>

        {/* ORDERS LIST */}
        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Orders will appear here once you complete a payment for a quoted upload.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-violet-600 to-blue-600"
            >
              <Upload className="w-5 h-5" />
              Upload Your First File
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short", year: "numeric" }
              );

              return (
                <div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-xl mb-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full font-medium">
                          <Clock className="w-4 h-4" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusBadgeClass(order.status)}`}
                      >
                        {statusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-2xl font-extrabold text-[#0F172A]">
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {order.tracking_number && (
                    <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Tracking:</span>
                      <span className="text-sm font-bold text-[#0F172A]">{order.tracking_number}</span>
                    </div>
                  )}

                  {/* Progress Stepper */}
                  <ProgressStepper currentStatus={order.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
