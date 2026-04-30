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
  ListOrdered,
  Calendar,
  Banknote,
  User,
  Phone,
  Mail,
  Activity,
  CheckSquare,
  Archive,
  Search,
  Filter,
  X,
  Copy,
  MessageCircle,
  AlertTriangle,
  PieChart,
  Users,
  Terminal,
  BarChart,
  ClipboardList
} from "lucide-react";

interface Upload {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_path?: string | null;
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

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const ORDER_STATUSES = ["confirmed", "queued", "printing", "quality_check", "shipped", "delivered", "cancelled"] as const;

function orderStatusEmoji(status: string) {
  switch (status) {
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

function orderStatusBadgeClass(status: string) {
  switch (status) {
    case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "queued": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "printing": return "bg-violet-100 text-violet-800 border-violet-200";
    case "quality_check": return "bg-cyan-100 text-cyan-800 border-cyan-200";
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
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [orderStatusLoading, setOrderStatusLoading] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"uploads" | "orders">("uploads");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [priorities, setPriorities] = useState<Record<string, string>>({});
  const [printTimes, setPrintTimes] = useState<Record<string, string>>({});
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [materialFilter, setMaterialFilter] = useState("All");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone");

    if (data) {
      const profileMap: Record<string, Profile> = {};
      data.forEach((p) => {
        profileMap[p.id] = p as Profile;
      });
      setProfiles(profileMap);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setAdminEmail(user.email ?? "");

      await Promise.all([fetchUploads(), fetchOrders(), fetchProfiles()]);
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

  const isOld = (dateStr: string) => {
    return (new Date().getTime() - new Date(dateStr).getTime()) > 24 * 60 * 60 * 1000;
  };

  const isToday = (dateStr: string) => {
    return new Date(dateStr).toDateString() === new Date().toDateString();
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

  const handleMoveToPending = async (id: string) => {
    setActionLoading(id);

    const { error } = await supabase
      .from("uploads")
      .update({ status: "pending" })
      .eq("id", id);

    if (error) {
      alert("Failed to move to pending: " + error.message);
    } else {
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

  const handleSaveTracking = async (orderId: string) => {
    const tracking = trackingNumbers[orderId];
    if (tracking === undefined) {
      alert("No changes to save.");
      return;
    }

    try {
      setTrackingLoading(orderId);
      const { error } = await supabase
        .from("orders")
        .update({ tracking_number: tracking })
        .eq("id", orderId);

      if (error) throw error;
      alert("Tracking number updated successfully!");
      await fetchOrders();
    } catch (error: any) {
      alert("Failed to update tracking: " + error.message);
    } finally {
      setTrackingLoading(null);
    }
  };

  const handleDownloadSTL = async (filePath?: string | null) => {
    if (!filePath) {
      alert("Missing storage path for this upload.");
      return;
    }

    const { data, error } = await supabase.storage
      .from("stl-files")
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      alert("Failed to generate download link: " + (error?.message || "Unknown error"));
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "waiting": return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "quoted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Admin Command Shortcuts execution
  const executeShortcut = (action: string) => {
    setSearchQuery("");
    setMaterialFilter("All");
    switch (action) {
      case "uploads": setActiveTab("uploads"); setStatusFilter("All"); break;
      case "orders": setActiveTab("orders"); setStatusFilter("All"); break;
      case "waiting": setActiveTab("uploads"); setStatusFilter("waiting"); break;
      case "pending": setActiveTab("uploads"); setStatusFilter("pending"); break;
      case "active_orders": setActiveTab("orders"); setStatusFilter("Active"); break;
      case "completed_orders": setActiveTab("orders"); setStatusFilter("Completed"); break;
    }
    window.scrollTo({ top: 800, behavior: "smooth" });
  };

  // Calculations for Capacity & Overviews
  const activeOrdersCount = orders.filter((o) => ["confirmed", "queued", "printing", "quality_check"].includes(o.status)).length;
  const activeUploadsCount = uploads.filter((u) => ["pending", "quoted"].includes(u.status)).length;
  const totalActiveWorkload = activeOrdersCount + activeUploadsCount;

  const DAILY_LIMIT = 5;
  const workloadPercentage = Math.min(100, Math.round((totalActiveWorkload / DAILY_LIMIT) * 100));
  let workloadStatus = "Normal";
  let workloadMessage = "Printer workload is under control.";
  let workloadColorClass = "bg-emerald-500";
  let workloadBgClass = "bg-emerald-50 border-emerald-200 text-emerald-800";

  if (totalActiveWorkload >= DAILY_LIMIT) {
    workloadStatus = "Full";
    workloadMessage = "Printer capacity full. Move waiting jobs only after a slot opens.";
    workloadColorClass = "bg-red-500";
    workloadBgClass = "bg-red-50 border-red-200 text-red-800";
  } else if (totalActiveWorkload >= 3) {
    workloadStatus = "Busy";
    workloadMessage = "Printer workload is high. Review delivery promises carefully.";
    workloadColorClass = "bg-orange-500";
    workloadBgClass = "bg-orange-50 border-orange-200 text-orange-800";
  }

  const todaysUploads = uploads.filter(u => isToday(u.created_at)).length;
  const waitingQueue = uploads.filter(u => u.status === "waiting").length;
  const pendingQuotes = uploads.filter(u => u.status === "pending").length;
  const paidConfirmedOrders = orders.filter(o => ["confirmed", "queued", "printing", "quality_check", "shipped", "delivered"].includes(o.status)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const todaysRevenue = orders.filter(o => isToday(o.created_at)).reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const completedOrdersCount = orders.filter(o => ["shipped", "delivered"].includes(o.status)).length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const totalCustomers = Object.keys(profiles).length;

  // Print Day Planner Calculation
  let totalMinutes = 0;
  Object.values(printTimes).forEach(timeStr => {
    const hoursMatch = timeStr.match(/(\d+)\s*h/i);
    const minutesMatch = timeStr.match(/(\d+)\s*m/i);
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1], 10);
  });
  const estHours = Math.floor(totalMinutes / 60);
  const estMins = totalMinutes % 60;

  // Recent Activity Feed (Top 5)
  const activities = [
    ...uploads.map(u => ({ id: u.id, type: 'upload', title: `New upload received: ${u.file_name}`, time: new Date(u.created_at) })),
    ...orders.map(o => ({ id: o.id, type: 'order', title: `Order confirmed: #${o.id.slice(0, 8).toUpperCase()}`, time: new Date(o.created_at) }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  // Filtered Data
  const filteredUploads = uploads.filter(u => {
    const profile = profiles[u.user_id];
    const matchSearch = searchQuery === "" ||
      u.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    const matchMaterial = materialFilter === "All" || u.material.toUpperCase() === materialFilter.toUpperCase();
    return matchSearch && matchStatus && matchMaterial;
  });

  const filteredOrders = orders.filter(o => {
    const profile = profiles[o.user_id];
    const matchSearch = searchQuery === "" ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.upload_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchStatus = false;
    if (statusFilter === "All") {
      matchStatus = true;
    } else if (statusFilter === "Active") {
      matchStatus = ["confirmed", "queued", "printing", "quality_check"].includes(o.status);
    } else if (statusFilter === "Completed") {
      matchStatus = ["shipped", "delivered", "cancelled"].includes(o.status);
    } else {
      matchStatus = o.status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  const productionOrders = filteredOrders.filter(o => ["confirmed", "queued", "printing", "quality_check"].includes(o.status));
  const completedOrdersList = filteredOrders.filter(o => ["shipped", "delivered", "cancelled"].includes(o.status));

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
              <img src="/logo-icon.png" alt="Powerlay" className="h-6 md:h-7 w-auto object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A] group-hover:text-[#7C3AED] transition-colors duration-300">
              POWERLAY
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Orders</Link>
            <Link href="/upload" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Upload</Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md cursor-default">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <span>{adminEmail || "Admin"}</span>
            </div>
            <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">

        {/* ADMIN QUICK STATS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex flex-wrap items-center gap-6 md:gap-10 mx-auto w-full justify-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Customers</p><p className="font-bold">{totalCustomers}</p></div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden md:block" />
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-violet-400" />
              <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Uploads</p><p className="font-bold">{uploads.length}</p></div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden md:block" />
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Orders</p><p className="font-bold">{orders.length}</p></div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden md:block" />
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Active Jobs</p><p className="font-bold">{totalActiveWorkload}</p></div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden md:block" />
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-purple-400" />
              <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Waiting</p><p className="font-bold">{waitingQueue}</p></div>
            </div>
          </div>
        </div>

        {/* HEADER & SHORTCUTS */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              <span className="text-xs font-semibold text-violet-800 tracking-wide uppercase">Admin Workspace</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-3 tracking-tight">Admin Command Center</h1>
            <p className="text-slate-500 text-lg max-w-2xl">Review uploads, manage orders, and monitor print capacity.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl p-4 md:min-w-[300px]">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Quick Shortcuts</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => executeShortcut('uploads')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">📦 All Uploads</button>
              <button onClick={() => executeShortcut('orders')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">🛒 All Orders</button>
              <button onClick={() => executeShortcut('waiting')} className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition-colors">⏳ Waiting Queue</button>
              <button onClick={() => executeShortcut('pending')} className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-xs font-semibold transition-colors">⚠️ Pending Quotes</button>
              <button onClick={() => executeShortcut('active_orders')} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-colors">🔥 Active Orders</button>
              <button onClick={() => executeShortcut('completed_orders')} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-colors">✅ Completed</button>
            </div>
          </div>
        </div>

        {/* RISK ALERTS */}
        {(waitingQueue > 0 || pendingQuotes > 3 || totalActiveWorkload >= DAILY_LIMIT || orders.some(o => o.status === 'printing')) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {waitingQueue > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-purple-900">Queue Active</p>
                  <p className="text-xs text-purple-700 mt-1">You have {waitingQueue} customers waiting in queue.</p>
                </div>
              </div>
            )}
            {pendingQuotes > 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-900">High Pending Volume</p>
                  <p className="text-xs text-yellow-700 mt-1">Too many pending quotes. Review soon.</p>
                </div>
              </div>
            )}
            {totalActiveWorkload >= DAILY_LIMIT && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-900">Capacity Full</p>
                  <p className="text-xs text-red-700 mt-1">Printer capacity full. Avoid new commitments.</p>
                </div>
              </div>
            )}
            {orders.some(o => o.status === 'printing') && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900">Active Jobs</p>
                  <p className="text-xs text-blue-700 mt-1">You have active print jobs running right now.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          <div className="flex-1 space-y-8">
            {/* ADMIN OVERVIEW DASHBOARD */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" /> Today's
                </p>
                <p className="text-3xl font-extrabold text-[#0F172A]">{todaysUploads}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-yellow-500" /> Pending
                </p>
                <p className="text-3xl font-extrabold text-[#0F172A]">{pendingQuotes}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-500" /> Confirmed
                </p>
                <p className="text-3xl font-extrabold text-[#0F172A]">{paidConfirmedOrders}</p>
              </div>
            </div>

            {/* REVENUE SNAPSHOT */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none" />
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-violet-400" /> Revenue Snapshot
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-2xl font-extrabold text-emerald-400">₹{totalRevenue}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Today's Revenue</p>
                  <p className="text-2xl font-extrabold text-white">₹{todaysRevenue}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Avg Order Value</p>
                  <p className="text-2xl font-extrabold text-white">₹{avgOrderValue}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Completed</p>
                  <p className="text-2xl font-extrabold text-white">{completedOrdersCount} orders</p>
                </div>
              </div>
            </div>

            {/* CAPACITY PANEL (With Meter) */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <Printer className="w-5 h-5 text-violet-600" /> Printer Capacity Control
                </h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border w-fit ${workloadStatus === "Full" ? "bg-red-100 text-red-800 border-red-200" : workloadStatus === "Busy" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-green-100 text-green-800 border-green-200"}`}>
                  Status: {workloadStatus}
                </div>
              </div>

              {/* Visual Workload Meter */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>Workload Progress</span>
                  <span>{totalActiveWorkload} / {DAILY_LIMIT} Slots</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-1000 ${workloadColorClass}`}
                    style={{ width: `${workloadPercentage}%` }}
                  />
                </div>
              </div>

              <div className={`rounded-xl p-4 text-sm flex items-center gap-3 font-medium border ${workloadBgClass}`}>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                {workloadMessage}
              </div>
            </div>
          </div>

          {/* SIDEBAR WIDGETS */}
          <div className="lg:w-80 w-full space-y-6">

            {/* PRINT DAY PLANNER */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-violet-500" /> Print Day Planner
              </h2>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center mb-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Est. Print Time</p>
                <p className="text-3xl font-extrabold text-violet-600">{estHours}h {estMins}m</p>
              </div>
              <p className="text-xs text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                Use this to plan today's print schedule. Planning data is local and not visible to customers.
              </p>
            </div>

            {/* OPERATIONS CHECKLIST */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" /> Ops Checklist
              </h2>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" /> Review new uploads</li>
                <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" /> Download STL before quote</li>
                <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" /> Estimate weight via slicer</li>
                <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" /> Send quotes & monitor payments</li>
                <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" /> Update order status tracking</li>
                <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" /> Mark delivered after completion</li>
              </ul>
            </div>

            {/* ADMIN ACTIVITY FEED */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col max-h-[300px]">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Recent Activity
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
                ) : (
                  activities.map((activity, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {i !== activities.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-[-16px] w-0.5 bg-slate-100" />
                      )}
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center z-10 ${activity.type === 'upload' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {activity.type === 'upload' ? <UploadCloud className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.time.toLocaleString("en-GB", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl p-4 mb-8 flex flex-col lg:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, File, Name, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 outline-none transition-all"
            />
          </div>
          <div className="flex w-full lg:w-auto items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="pending">Pending</option>
                <option value="quoted">Quoted</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <optgroup label="Orders Groups">
                  <option value="Active">Active Orders</option>
                  <option value="Completed">Completed Orders</option>
                </optgroup>
                <optgroup label="Orders Specific">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              </select>
            </div>
            {activeTab === "uploads" && (
              <select
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none rounded-xl px-3 py-2"
              >
                <option value="All">All Material</option>
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
              </select>
            )}
            {(searchQuery || statusFilter !== "All" || materialFilter !== "All") && (
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("All"); setMaterialFilter("All"); }}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 mb-8 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-1.5 w-fit">
          <button
            onClick={() => { setActiveTab("uploads"); setStatusFilter("All"); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "uploads"
              ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            📦 Uploads ({filteredUploads.length})
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setStatusFilter("All"); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "orders"
              ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            🛒 Orders ({filteredOrders.length})
          </button>
        </div>

        {/* UPLOADS LIST */}
        {activeTab === "uploads" && (
          <div className="space-y-6">
            {filteredUploads.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">No uploads found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">There are no uploads matching your current criteria.</p>
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("All"); setMaterialFilter("All"); }}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (

              filteredUploads.map((upload) => {
                const userProfile = profiles[upload.user_id];
                const needsAttention = upload.status === 'waiting' || (upload.status === 'pending' && isOld(upload.created_at));

                return (
                  <div
                    key={upload.id}
                    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border p-6 lg:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden ${needsAttention ? "border-red-300" : "border-slate-200"}`}
                  >
                    {needsAttention && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                    )}

                    {/* Top Row: File name + Status */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-[#0F172A] text-xl truncate max-w-lg">
                            {upload.file_name}
                          </h3>
                          {needsAttention && (
                            <span className="bg-red-100 text-red-800 text-[10px] uppercase font-extrabold px-2 py-1 rounded-md animate-pulse flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Needs Attention
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full font-medium">
                            <Clock className="w-4 h-4" />
                            {formatDate(upload.created_at)}
                          </span>
                          <span className="text-xs break-all bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                            ID: {upload.id.slice(0, 8)}...
                            <button onClick={() => copyToClipboard(upload.id)} className="hover:text-blue-600 transition-colors" title="Copy Upload ID"><Copy className="w-3 h-3" /></button>
                          </span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusBadge(upload.status)}`}>
                        {upload.status === "pending" && "🟡"}
                        {upload.status === "quoted" && "🔵"}
                        {upload.status === "paid" && "🟢"}
                        {upload.status === "rejected" && "🔴"}
                        {upload.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Customer Info & Quick Actions */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6">
                      <div className="flex flex-wrap gap-4 lg:gap-8">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><User className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Customer</p>
                            <p className="text-sm font-semibold text-slate-800">{userProfile?.full_name || "Unknown User"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><Mail className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Email</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-slate-800">{userProfile?.email || "N/A"}</p>
                              {userProfile?.email && <button onClick={() => copyToClipboard(userProfile.email!)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Copy Email"><Copy className="w-3 h-3" /></button>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><Phone className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Phone</p>
                            <p className={`text-sm font-semibold ${userProfile?.phone ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                              {userProfile?.phone || "Phone not available"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-2 self-start md:self-center border-t md:border-t-0 md:border-l border-blue-200 pt-3 md:pt-0 md:pl-4 w-full md:w-auto">
                        {userProfile?.phone && (
                          <button onClick={() => window.open(`https://wa.me/${userProfile.phone?.replace(/\D/g, '')}`, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-lg text-xs font-bold transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </button>
                        )}
                        {userProfile?.email && (
                          <button onClick={() => window.open(`mailto:${userProfile.email}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors">
                            <Mail className="w-3.5 h-3.5" /> Email
                          </button>
                        )}
                      </div>
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
                          <div>
                            <label className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1.5 block">Est. Weight (g)</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Weight className="h-4 w-4 text-violet-400" /></div>
                              <input
                                type="number"
                                min={1}
                                placeholder="e.g. 45"
                                value={weights[upload.id] ?? ""}
                                onChange={(e) => setWeights((prev) => ({ ...prev, [upload.id]: e.target.value }))}
                                className="pl-9 pr-3 py-2.5 border border-violet-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-violet-400 focus:border-violet-400 font-medium text-[#0F172A] bg-white outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="bg-white/80 rounded-xl border border-violet-100 p-3 space-y-1.5">
                            <div className="flex justify-between text-xs"><span className="text-slate-500">Rate</span><span className="font-semibold text-[#0F172A]">₹{getMaterialRate(upload.material)}/g × {upload.quantity} qty</span></div>
                            <div className="flex justify-between text-xs"><span className="text-slate-500">Min Order</span><span className="font-semibold text-[#0F172A]">₹149</span></div>
                            <div className="flex justify-between text-xs"><span className="text-slate-500">Shipping</span><span className="font-semibold text-[#0F172A]">₹60</span></div>
                          </div>

                          <div className="bg-white/80 rounded-xl border border-violet-100 p-3 flex flex-col justify-center items-center">
                            <p className="text-xs text-slate-500 mb-1">Suggested Quote</p>
                            <p className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                              {calcSuggestedQuote(upload.id, upload.material, upload.quantity) != null ? `₹${calcSuggestedQuote(upload.id, upload.material, upload.quantity)}` : "—"}
                            </p>
                          </div>

                          <div>
                            <button
                              type="button"
                              disabled={calcSuggestedQuote(upload.id, upload.material, upload.quantity) == null}
                              onClick={() => {
                                const suggested = calcSuggestedQuote(upload.id, upload.material, upload.quantity);
                                if (suggested != null) setPrices((prev) => ({ ...prev, [upload.id]: String(suggested) }));
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 shadow-sm"
                            >
                              <Zap className="w-4 h-4" /> Use Suggested
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-100">

                      <button onClick={() => handleDownloadSTL(upload.file_path)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border border-slate-200">
                        <Download className="w-4 h-4" /> Download STL
                      </button>

                      {upload.status === "pending" && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                          <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee className="h-4 w-4 text-slate-400" /></div>
                            <input
                              type="number"
                              min={1}
                              placeholder="Amount"
                              value={prices[upload.id] ?? ""}
                              onChange={(e) => setPrices((prev) => ({ ...prev, [upload.id]: e.target.value }))}
                              className="pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm w-full sm:w-32 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium text-[#0F172A] bg-white outline-none transition-all"
                            />
                          </div>
                          <button onClick={() => handleSendQuote(upload.id)} disabled={actionLoading === upload.id} className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
                            {actionLoading === upload.id ? "Sending..." : "Send Quote"}
                          </button>
                          <button onClick={() => handleReject(upload.id)} disabled={actionLoading === upload.id} className="w-full sm:w-auto inline-flex items-center justify-center bg-white border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {actionLoading === upload.id ? "Working..." : "Reject"}
                          </button>
                        </div>
                      )}

                      {upload.status === "waiting" && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => handleMoveToPending(upload.id)}
                            disabled={actionLoading === upload.id || totalActiveWorkload >= DAILY_LIMIT}
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                          >
                            {totalActiveWorkload >= DAILY_LIMIT ? "Capacity Full" : actionLoading === upload.id ? "Moving..." : "Move to Pending"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-12">
            {filteredOrders.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">No orders found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Adjust your search or filters to find what you're looking for.</p>
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("All"); setMaterialFilter("All"); }}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* PRODUCTION QUEUE */}
                {productionOrders.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A] mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                      <Activity className="w-6 h-6 text-violet-600" /> Production Queue
                    </h2>
                    <div className="space-y-6">
                      {productionOrders.map((order) => {
                        const userProfile = profiles[order.user_id];
                        const orderNeedsAttention = order.status === 'printing' && isOld(order.created_at);

                        return (
                          <div key={order.id} className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border p-6 lg:p-8 hover:shadow-md transition-shadow duration-300 relative overflow-hidden ${orderNeedsAttention ? "border-red-300" : "border-violet-200"}`}>
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${orderNeedsAttention ? "bg-red-500" : "bg-violet-500"}`} />

                            {/* Top Row */}
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-[#0F172A] text-xl">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                  {orderNeedsAttention && (
                                    <span className="bg-red-100 text-red-800 text-[10px] uppercase font-extrabold px-2 py-1 rounded-md animate-pulse flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> Needs Attention
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full font-medium">
                                    <Clock className="w-4 h-4" /> {formatDate(order.created_at)}
                                  </span>
                                  {order.upload_id && (
                                    <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-medium flex items-center gap-2">
                                      Upload: {order.upload_id.slice(0, 8)}
                                      <button onClick={() => copyToClipboard(order.upload_id!)} className="hover:text-blue-600" title="Copy Upload ID"><Copy className="w-3 h-3" /></button>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${orderStatusBadgeClass(order.status)}`}>
                                  {orderStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                {order.status === 'shipped' && !order.tracking_number && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-extrabold px-2 py-1 rounded-md animate-pulse flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Tracking needed
                                  </span>
                                )}
                                <span className="text-2xl font-extrabold text-[#0F172A]">₹{order.total_amount}</span>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="flex flex-col md:flex-row justify-between gap-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6">
                              <div className="flex flex-wrap gap-4 lg:gap-8">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><User className="w-4 h-4" /></div>
                                  <div>
                                    <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Customer</p>
                                    <p className="text-sm font-semibold text-slate-800">{userProfile?.full_name || "Unknown User"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><Mail className="w-4 h-4" /></div>
                                  <div>
                                    <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Email</p>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm font-semibold text-slate-800">{userProfile?.email || "N/A"}</p>
                                      {userProfile?.email && <button onClick={() => copyToClipboard(userProfile.email!)} className="text-slate-400 hover:text-blue-600" title="Copy Email"><Copy className="w-3 h-3" /></button>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-100 rounded-full text-blue-600"><Phone className="w-4 h-4" /></div>
                                  <div>
                                    <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Phone</p>
                                    <p className={`text-sm font-semibold ${userProfile?.phone ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                                      {userProfile?.phone || "Phone not available"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Contact Actions */}
                              <div className="flex items-center gap-2 self-start md:self-center border-t md:border-t-0 md:border-l border-blue-200 pt-3 md:pt-0 md:pl-4 w-full md:w-auto">
                                {userProfile?.phone && (
                                  <button onClick={() => window.open(`https://wa.me/${userProfile.phone?.replace(/\D/g, '')}`, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-lg text-xs font-bold transition-colors">
                                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                  </button>
                                )}
                                {userProfile?.email && (
                                  <button onClick={() => window.open(`mailto:${userProfile.email}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold transition-colors">
                                    <Mail className="w-3.5 h-3.5" /> Email
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                              <div><p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Order ID</p><p className="text-[#0F172A] font-bold text-sm break-all">{order.id}</p></div>
                              <div><p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Customer ID</p><p className="text-[#0F172A] font-bold text-sm break-all">{order.user_id.slice(0, 12)}…</p></div>
                              <div><p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Amount</p><p className="text-[#0F172A] font-bold">₹{order.total_amount}</p></div>
                              <div>
                                <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide flex items-center gap-1">
                                  Tracking {order.tracking_number && <button onClick={() => { copyToClipboard(order.tracking_number!); alert("Tracking copied!"); }} className="text-slate-400 hover:text-blue-600"><Copy className="w-3 h-3" /></button>}
                                </p>
                                <p className="text-[#0F172A] font-bold text-sm truncate">{order.tracking_number || "—"}</p>
                              </div>
                            </div>

                            {/* Tracking Management */}
                            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-5 mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Truck className="w-4 h-4 text-blue-600" />
                                <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Tracking Management</p>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative flex-1 w-full">
                                  <input
                                    type="text"
                                    placeholder="Enter tracking number"
                                    defaultValue={order.tracking_number || ""}
                                    onChange={(e) => setTrackingNumbers({ ...trackingNumbers, [order.id]: e.target.value })}
                                    className="w-full bg-white border border-blue-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-400 font-medium text-[#0F172A]"
                                  />
                                </div>
                                <button
                                  onClick={() => handleSaveTracking(order.id)}
                                  disabled={trackingLoading === order.id}
                                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 min-w-[140px]"
                                >
                                  {trackingLoading === order.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Tracking"}
                                </button>
                              </div>
                            </div>

                            {/* Priority & Internal Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 border border-amber-100 rounded-2xl p-5 mb-6">
                              <div className="col-span-1 md:col-span-3"><p className="text-amber-700 text-xs font-semibold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Local planning only — not visible to customer</p></div>
                              <div>
                                <p className="text-amber-800 text-xs font-semibold mb-1 uppercase tracking-wide">Priority</p>
                                <select className="w-full bg-white border border-amber-200 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400" value={priorities[order.id] || "Normal"} onChange={(e) => setPriorities({ ...priorities, [order.id]: e.target.value })}>
                                  <option value="Normal">Normal</option><option value="Urgent">Urgent 🔥</option><option value="Hold">On Hold ⏸️</option>
                                </select>
                              </div>
                              <div>
                                <p className="text-amber-800 text-xs font-semibold mb-1 uppercase tracking-wide">Est. Print Time</p>
                                <input type="text" placeholder="e.g. 4h 30m" className="w-full bg-white border border-amber-200 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400" value={printTimes[order.id] || ""} onChange={(e) => setPrintTimes({ ...printTimes, [order.id]: e.target.value })} />
                              </div>
                              <div>
                                <p className="text-amber-800 text-xs font-semibold mb-1 uppercase tracking-wide">Internal Admin Note</p>
                                <input type="text" placeholder="Admin notes..." className="w-full bg-white border border-amber-200 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400" value={adminNotes[order.id] || ""} onChange={(e) => setAdminNotes({ ...adminNotes, [order.id]: e.target.value })} />
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
                                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:cursor-not-allowed ${isActive ? `${orderStatusBadgeClass(s)} ring-2 ring-offset-1 ring-current opacity-100` : `bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:-translate-y-0.5 disabled:opacity-50`}`}
                                    >
                                      {orderStatusLoading === order.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : orderStatusEmoji(s)}
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* COMPLETED / CLOSED ORDERS */}
                {completedOrdersList.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-600 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2 mt-8">
                      <Archive className="w-5 h-5" /> Completed / Closed Orders
                    </h2>
                    <div className="space-y-6">
                      {completedOrdersList.map((order) => {
                        const userProfile = profiles[order.user_id];
                        return (
                          <div key={order.id} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 opacity-80 hover:opacity-100">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                              <div>
                                <h3 className="font-bold text-[#0F172A] text-lg mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                                  <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3 h-3" /> {formatDate(order.created_at)}</span>
                                  {order.upload_id && <span className="text-xs font-medium">Upload: {order.upload_id.slice(0, 8)}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${orderStatusBadgeClass(order.status)}`}>
                                  {orderStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                {order.status === 'shipped' && !order.tracking_number && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-extrabold px-2 py-1 rounded-md animate-pulse flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Tracking needed
                                  </span>
                                )}
                                <span className="text-xl font-extrabold text-[#0F172A]">₹{order.total_amount}</span>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 bg-slate-100/50 rounded-xl p-3 mb-4">
                              <p className="text-sm text-slate-700"><strong>Customer:</strong> {userProfile?.full_name || "Unknown"} ({userProfile?.email || "N/A"})</p>
                              {userProfile?.phone && <p className="text-sm text-slate-700"><strong>Phone:</strong> {userProfile.phone}</p>}
                            </div>

                            {/* Tracking Management for Completed */}
                            <div className="bg-blue-50/20 border border-blue-100 rounded-xl p-4 mb-4">
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative flex-1 w-full">
                                  <input
                                    type="text"
                                    placeholder="Tracking number"
                                    defaultValue={order.tracking_number || ""}
                                    onChange={(e) => setTrackingNumbers({ ...trackingNumbers, [order.id]: e.target.value })}
                                    className="w-full bg-white border border-blue-100 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 font-medium text-[#0F172A]"
                                  />
                                </div>
                                <button
                                  onClick={() => handleSaveTracking(order.id)}
                                  disabled={trackingLoading === order.id}
                                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all min-w-[100px]"
                                >
                                  {trackingLoading === order.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Save"}
                                </button>
                                {order.tracking_number && (
                                  <button onClick={() => { copyToClipboard(order.tracking_number!); alert("Tracking copied!"); }} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                              <p className="text-xs font-semibold text-slate-500 mr-2">Change Status:</p>
                              {ORDER_STATUSES.map((s) => {
                                const isActive = order.status === s;
                                return (
                                  <button
                                    key={s}
                                    disabled={isActive || orderStatusLoading === order.id}
                                    onClick={() => handleUpdateOrderStatus(order.id, s)}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:cursor-not-allowed ${isActive ? `${orderStatusBadgeClass(s)} ring-1 ring-offset-1 ring-current opacity-100` : `bg-white border-slate-200 text-slate-500 hover:border-slate-400 disabled:opacity-50`}`}
                                  >
                                    {orderStatusLoading === order.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : orderStatusEmoji(s)}
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
