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
  ShieldAlert
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

export default function AdminPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUploads = async () => {
    const { data } = await supabase
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false });

    setUploads(data ?? []);
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

      await fetchUploads();
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
            Review uploads, send quotes, and manage customer requests.
          </p>
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
      </div>
    </div>
  );
}
