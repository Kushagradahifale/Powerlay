"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Upload {
  id: string;
  file_name: string;
  material: string;
  quantity: number;
  status: string;
  price: number | null;
  price_quoted: number | null;
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const ORDER_STEPS = ["confirmed", "printing", "shipped", "delivered"];

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");

      const fetchData = async () => {
        const { data: uploads } = await supabase
          .from("uploads")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setUploads(uploads ?? []);

        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setOrders(orders ?? []);
      };

      await fetchData();
      setLoading(false);

      interval = setInterval(fetchData, 5000);
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const totalUploads = uploads.length;
  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const quotedCount = uploads.filter((u) => u.status === "quoted").length;

  const uploadStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "quoted":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300";
      case "paid":
        return "bg-green-100 text-green-800 border border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const orderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "printing":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "shipped":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStepIndex = (status: string) => {
    return ORDER_STEPS.indexOf(status);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl animate-blob" />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED] relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">

          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo-icon.png" className="h-7" />
            <span className="font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition">
              POWERLAY
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-[#64748B] hover:text-[#7C3AED] transition-colors">Home</Link>
            <Link href="/dashboard" className="text-[#7C3AED] font-bold">Dashboard</Link>
            <Link href="/orders" className="text-[#64748B] hover:text-[#7C3AED] transition-colors">Orders</Link>
            <Link href="/upload" className="text-[#64748B] hover:text-[#7C3AED] transition-colors">Upload</Link>
          </div>

        </div>
      </nav>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full filter blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl z-0" />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-12 space-y-8 relative z-10">

        {/* Welcome Card */}
        <div className="glass-card card-shadow border border-slate-200/80 rounded-3xl p-8 flex justify-between items-center bg-white/70">
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-3">
            <span className="text-3xl">👋</span> Welcome, {userEmail}
          </h1>
          <button
            onClick={handleLogout}
            className="border border-slate-200 text-[#64748B] px-5 py-2.5 rounded-xl hover:bg-slate-100 hover:text-[#0F172A] transition-colors font-medium text-sm"
          >
            Logout
          </button>
        </div>

        {/* Upload Button */}
        <div>
          <Link href="/upload"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
            <span className="text-xl">+</span> Upload New File
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl border border-slate-200/60 p-6 card-shadow hover:card-shadow-hover transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#7C3AED]" />
            <p className="text-[#64748B] text-sm font-medium mb-1">Total Uploads</p>
            <p className="text-4xl font-bold text-[#0F172A]">{totalUploads}</p>
          </div>
          <div className="glass-card rounded-3xl border border-slate-200/60 p-6 card-shadow hover:card-shadow-hover transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
            <p className="text-[#64748B] text-sm font-medium mb-1">Pending Quotes</p>
            <p className="text-4xl font-bold text-[#0F172A]">{pendingCount}</p>
          </div>
          <div className="glass-card rounded-3xl border border-slate-200/60 p-6 card-shadow hover:card-shadow-hover transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <p className="text-[#64748B] text-sm font-medium mb-1">Quoted Items</p>
            <p className="text-4xl font-bold text-[#0F172A]">{quotedCount}</p>
          </div>
        </div>

        {/* Your Uploads */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0F172A]">Your Uploads</h2>
            <div className="h-px bg-slate-200 flex-grow" />
          </div>

          {uploads.length === 0 ? (
            <div className="glass-card rounded-3xl border border-slate-200/60 p-12 text-center text-[#64748B]">No uploads yet. Upload your first STL file!</div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="glass-card rounded-2xl border border-slate-200/60 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:card-shadow transition-all duration-300"
                >
                  <div>
                    <p className="font-bold text-[#0F172A] text-lg">{upload.file_name}</p>
                    <p className="text-[#64748B] text-sm mt-1">
                      {upload.material} &middot; Qty: {upload.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold ${uploadStatusBadge(upload.status)}`}>
                      {upload.status === "waiting" && "🟣"}
                      {upload.status === "pending" && "🟡"}
                      {upload.status === "quoted" && "🔵"}
                      {upload.status === "paid" && "🟢"}
                      {upload.status === "rejected" && "🔴"}

                      {upload.status === "waiting" ? "Waiting Queue" : upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                    </span>

                    <span className="text-sm font-bold text-[#0F172A] min-w-20">
                      {upload.status === "quoted" && upload.price_quoted != null
                        ? `₹${upload.price_quoted}`
                        : ""}
                    </span>

                    {upload.status === "quoted" && (
                      <Link href={`/checkout?upload_id=${upload.id}&amount=${upload.price_quoted}`}>
                        <button
                          className="text-white font-bold px-6 py-2 rounded-xl shadow-md shadow-purple-200 hover:-translate-y-0.5 transition-all text-sm"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                        >
                          Pay Now
                        </button>
                      </Link>
                    )}

                    {upload.status === "pending" && (
                      <button disabled className="bg-slate-100 text-slate-400 px-6 py-2 rounded-xl text-sm font-medium cursor-not-allowed">
                        Awaiting Quote
                      </button>
                    )}

                  </div>

                  {upload.status === "waiting" && (
                    <div className="w-full mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-purple-800 text-sm font-medium">
                        Your file is queued due to current printer load.
                      </p>
                    </div>
                  )}

                  {upload.status === "rejected" && (
                    <div className="w-full mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-red-800 text-sm font-medium">
                        This file could not be quoted. Please upload a corrected file.
                      </p>
                      <Link href="/upload">
                        <button className="bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 font-bold px-5 py-2 rounded-xl text-sm transition-all whitespace-nowrap">
                          Re-upload
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Orders */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0F172A]">Your Orders</h2>
            <div className="h-px bg-slate-200 flex-grow" />
          </div>

          {orders.length === 0 ? (
            <div className="glass-card rounded-3xl border border-slate-200/60 p-12 text-center text-[#64748B]">No orders yet. Orders will appear here after payment.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="glass-card rounded-2xl border border-slate-200/60 p-6 hover:card-shadow transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#0F172A] text-lg">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-[#64748B] text-sm mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${orderStatusBadge(order.status)}`}>
                        {order.status === "pending" && "🟡"}
                        {order.status === "confirmed" && "🔵"}
                        {order.status === "printing" && "🟣"}
                        {order.status === "shipped" && "🟠"}
                        {order.status === "delivered" && "🟢"}
                        {order.status === "cancelled" && "🔴"}

                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-[#0F172A]">
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Order Progress Timeline */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    {ORDER_STEPS.map((step, i) => {
                      const currentIndex = getStepIndex(order.status);

                      return (
                        <div key={step} className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${i <= currentIndex ? "bg-green-500" : "bg-gray-300"
                              }`}
                          />

                          {i !== ORDER_STEPS.length - 1 && (
                            <div
                              className={`w-8 h-[2px] ${i < currentIndex ? "bg-green-500" : "bg-gray-300"
                                }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
