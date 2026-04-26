"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  IndianRupee,
  ShieldAlert,
  Calculator,
  Zap,
  Weight,
  Package,
  Truck,
  Printer,
  RefreshCw,
} from "lucide-react";

interface Upload {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  material: string;
  quantity: number;
  infill_percent: number;
  notes: string;
  status: string;
  price_quoted: number | null;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  upload_id: string | null;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

const ORDER_STATUSES = ["confirmed", "printing", "shipped", "delivered", "cancelled"] as const;

function orderStatusEmoji(status: string) {
  switch (status) {
    case "confirmed": return "🔵";
    case "printing": return "🟣";
    case "shipped": return "🟠";
    case "delivered": return "🟢";
    case "cancelled": return "🔴";
    default: return "⚪";
  }
}

function orderStatusBadgeClass(status: string) {
  switch (status) {
    case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "printing": return "bg-violet-100 text-violet-800 border-violet-200";
    case "shipped": return "bg-orange-100 text-orange-800 border-orange-200";
    case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [orderStatusLoading, setOrderStatusLoading] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"uploads" | "orders">("uploads");

  const getMaterialRate = (material: string) => {
    return material.toUpperCase() === "PETG" ? 8 : 6;
  };

  const calcSuggestedQuote = (uploadId: string, material: string, quantity: number) => {
    const weightStr = weights[uploadId];
    const weight = parseFloat(weightStr);
    if (!weightStr || isNaN(weight) || weight <= 0) return null;
    const rate = getMaterialRate(material);
    const rawCost = weight * rate * quantity;
    const baseCost = Math.max(rawCost, 149);
    return Math.round(baseCost + 60);
  };

  const fetchUploads = async () => {
    const { data } = await supabase
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false });

    setUploads(data ?? []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    setOrders(data ?? []);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.email !== "kushagradahifale6@gmail.com") {
        router.push("/dashboard");
        return;
      }

      await Promise.all([fetchUploads(), fetchOrders()]);
      setLoading(false);
    };

    init();
  }, [router]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSendQuote = async (uploadId: string) => {
    const priceStr = prices[uploadId];
    const price = parseFloat(priceStr);

    if (!priceStr || isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setActionLoading(uploadId);

    const { error } = await supabase
      .from("uploads")
      .update({ status: "quoted", price_quoted: price })
      .eq("id", uploadId);

    if (error) {
      alert("Failed to send quote: " + error.message);
    } else {
      alert("Quote sent successfully!");
      setPrices((prev) => ({ ...prev, [uploadId]: "" }));
      await fetchUploads();
    }

    setActionLoading(null);
  };

  const handleReject = async (uploadId: string) => {
    setActionLoading(uploadId);

    const { error } = await supabase
      .from("uploads")
      .update({ status: "rejected" })
      .eq("id", uploadId);

    if (error) {
      alert("Failed to reject: " + error.message);
    } else {
      alert("Upload rejected");
      await fetchUploads();
    }

    setActionLoading(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrderStatusLoading(orderId);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Failed to update order: " + error.message);
    } else {
      alert(`Order status updated to "${newStatus}"`);
      await fetchOrders();
    }

    setOrderStatusLoading(null);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "quoted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const totalUploads = uploads.length;
  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const quotedCount = uploads.filter((u) => u.status === "quoted").length;
  const rejectedCount = uploads.filter((u) => u.status === "rejected").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-24 text-[#1E293B]">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* FLOATING NAVBAR */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-300">
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
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Orders
            </Link>
            <Link href="/upload" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Upload
            </Link>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md cursor-default">
            <ShieldAlert className="w-4 h-4 text-violet-400" />
            <span className="hidden sm:inline">Admin</span>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span className="text-xs font-semibold text-violet-800 tracking-wide uppercase">
              Admin Workspace
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-3 tracking-tight">
            Admin Command Center
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Review uploads, send quotes, and manage orders.
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 mb-10 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-1.5 w-fit">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "uploads"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            📦 Uploads ({uploads.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🛒 Orders ({orders.length})
          </button>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800" />
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-sm font-medium">Total Uploads</p>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{totalUploads}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-sm font-medium">Pending</p>
              <div className="p-2 rounded-xl bg-yellow-50 text-yellow-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{pendingCount}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-sm font-medium">Quoted</p>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{quotedCount}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-sm font-medium">Rejected</p>
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{rejectedCount}</p>
          </div>
        </div>

        {/* UPLOADS LIST */}
        {activeTab === "uploads" && (
        <div className="space-y-6">
          {uploads.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">No uploads yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                When customers submit their 3D models for a quote, they will appear here.
              </p>
            </div>
          ) : (
            uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8 hover:shadow-md transition-shadow duration-300"
              >
                {/* Top Row: File name + Status */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-xl truncate max-w-lg mb-2">
                      {upload.file_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full font-medium">
                        <Clock className="w-4 h-4" />
                        {formatDate(upload.created_at)}
                      </span>
                      <span className="text-xs break-all hidden sm:inline-block">ID: {upload.id}</span>
                    </div>
                  </div>
                  
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusBadge(upload.status)}`}
                  >
                    {upload.status === "pending" && "🟡"}
                    {upload.status === "quoted" && "🔵"}
                    {upload.status === "paid" && "🟢"}
                    {upload.status === "rejected" && "🔴"}
                    {upload.status.toUpperCase()}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Material</p>
                    <p className="text-[#0F172A] font-bold">{upload.material}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Quantity</p>
                    <p className="text-[#0F172A] font-bold">{upload.quantity}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Infill</p>
                    <p className="text-[#0F172A] font-bold">{upload.infill_percent}%</p>
                  </div>
                  {upload.price_quoted != null && (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Quoted Price</p>
                      <p className="text-[#0F172A] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded inline-block">
                        ₹{upload.price_quoted}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {upload.notes && (
                  <div className="mb-6 bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-amber-800 text-xs font-bold mb-1 uppercase tracking-wide">Customer Notes</p>
                    <p className="text-amber-900 text-sm">{upload.notes}</p>
                  </div>
                )}

                {/* Quote Calculator (only for pending) */}
                {upload.status === "pending" && (
                  <div className="mb-6 bg-violet-50/70 border border-violet-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-violet-100">
                        <Calculator className="w-4 h-4 text-violet-600" />
                      </div>
                      <p className="text-sm font-bold text-violet-900">Quote Calculator</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      {/* Weight Input */}
                      <div>
                        <label className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1.5 block">
                          Est. Weight (g)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Weight className="h-4 w-4 text-violet-400" />
                          </div>
                          <input
                            type="number"
                            min={1}
                            placeholder="e.g. 45"
                            value={weights[upload.id] ?? ""}
                            onChange={(e) =>
                              setWeights((prev) => ({
                                ...prev,
                                [upload.id]: e.target.value,
                              }))
                            }
                            className="pl-9 pr-3 py-2.5 border border-violet-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-violet-400 focus:border-violet-400 font-medium text-[#0F172A] bg-white outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="bg-white/80 rounded-xl border border-violet-100 p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Rate</span>
                          <span className="font-semibold text-[#0F172A]">₹{getMaterialRate(upload.material)}/g × {upload.quantity} qty</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Min Order</span>
                          <span className="font-semibold text-[#0F172A]">₹149</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Shipping</span>
                          <span className="font-semibold text-[#0F172A]">₹60</span>
                        </div>
                      </div>

                      {/* Suggested Price */}
                      <div className="bg-white/80 rounded-xl border border-violet-100 p-3 flex flex-col justify-center items-center">
                        <p className="text-xs text-slate-500 mb-1">Suggested Quote</p>
                        <p className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                          {calcSuggestedQuote(upload.id, upload.material, upload.quantity) != null
                            ? `₹${calcSuggestedQuote(upload.id, upload.material, upload.quantity)}`
                            : "—"}
                        </p>
                      </div>

                      {/* Use Suggested Price Button */}
                      <div>
                        <button
                          type="button"
                          disabled={calcSuggestedQuote(upload.id, upload.material, upload.quantity) == null}
                          onClick={() => {
                            const suggested = calcSuggestedQuote(upload.id, upload.material, upload.quantity);
                            if (suggested != null) {
                              setPrices((prev) => ({ ...prev, [upload.id]: String(suggested) }));
                            }
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 shadow-sm"
                        >
                          <Zap className="w-4 h-4" />
                          Use Suggested Price
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-100">
                  
                  {/* Download Link */}
                  <a
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border border-slate-200"
                  >
                    <Download className="w-4 h-4" />
                    Download STL
                  </a>

                  {/* Actions (only for pending) */}
                  {upload.status === "pending" && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          min={1}
                          placeholder="Amount"
                          value={prices[upload.id] ?? ""}
                          onChange={(e) =>
                            setPrices((prev) => ({
                              ...prev,
                              [upload.id]: e.target.value,
                            }))
                          }
                          className="pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm w-full sm:w-32 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium text-[#0F172A] bg-white outline-none transition-all"
                        />
                      </div>
                      <button
                        onClick={() => handleSendQuote(upload.id)}
                        disabled={actionLoading === upload.id}
                        className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                      >
                        {actionLoading === upload.id ? "Sending..." : "Send Quote"}
                      </button>
                      <button
                        onClick={() => handleReject(upload.id)}
                        disabled={actionLoading === upload.id}
                        className="w-full sm:w-auto inline-flex items-center justify-center bg-white border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {actionLoading === upload.id ? "Working..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {/* ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">No orders yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Orders will appear here after customers complete payments.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Top Row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-xl mb-2">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full font-medium">
                          <Clock className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </span>
                        {order.upload_id && (
                          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-medium">
                            Upload: {order.upload_id.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${orderStatusBadgeClass(order.status)}`}
                      >
                        {orderStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-2xl font-extrabold text-[#0F172A]">
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Order ID</p>
                      <p className="text-[#0F172A] font-bold text-sm break-all">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Customer ID</p>
                      <p className="text-[#0F172A] font-bold text-sm break-all">{order.user_id.slice(0, 12)}…</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Amount</p>
                      <p className="text-[#0F172A] font-bold">₹{order.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Tracking</p>
                      <p className="text-[#0F172A] font-bold text-sm">{order.tracking_number || "—"}</p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-600">Update Status:</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {ORDER_STATUSES.map((s) => {
                        const isActive = order.status === s;
                        return (
                          <button
                            key={s}
                            disabled={isActive || orderStatusLoading === order.id}
                            onClick={() => handleUpdateOrderStatus(order.id, s)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:cursor-not-allowed ${
                              isActive
                                ? `${orderStatusBadgeClass(s)} ring-2 ring-offset-1 ring-current opacity-100`
                                : `bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:-translate-y-0.5 disabled:opacity-50`
                            }`}
                          >
                            {orderStatusLoading === order.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              orderStatusEmoji(s)
                            )}
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
