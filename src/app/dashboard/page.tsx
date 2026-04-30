"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileClock,
  Clock,
  Package,
  CheckCircle2,
  MessageCircle,
  Mail,
  Info,
  ShieldAlert,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

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

const ORDER_STEPS = ["confirmed", "queued", "printing", "quality_check", "shipped", "delivered"];

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
  const waitingCount = uploads.filter((u) => u.status === "waiting").length;
  const inProgressOrders = orders.filter(o => ["confirmed", "queued", "printing", "quality_check"].includes(o.status)).length;
  const completedOrders = orders.filter(o => ["shipped", "delivered"].includes(o.status)).length;

  const uploadStatusBadge = (status: string) => {
    switch (status) {
      case "waiting": return "bg-purple-100 text-purple-800 border border-purple-300";
      case "pending": return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "quoted": return "bg-blue-100 text-blue-800 border border-blue-300";
      case "rejected": return "bg-red-100 text-red-800 border border-red-300";
      case "paid": return "bg-green-100 text-green-800 border border-green-300";
      default: return "bg-slate-100 text-slate-800 border border-slate-300";
    }
  };

  const orderStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "confirmed": return "bg-blue-100 text-blue-800 border border-blue-300";
      case "queued": return "bg-orange-100 text-orange-800 border border-orange-300";
      case "printing": return "bg-violet-100 text-violet-800 border border-violet-300";
      case "quality_check": return "bg-cyan-100 text-cyan-800 border border-cyan-300";
      case "shipped": return "bg-indigo-100 text-indigo-800 border border-indigo-300";
      case "delivered": return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "cancelled": return "bg-red-100 text-red-800 border border-red-300";
      default: return "bg-slate-100 text-slate-800 border border-slate-300";
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

  const uploadStatusExplanation = (status: string) => {
    switch(status) {
      case 'waiting': return "Your file is in queue due to current printer load.";
      case 'pending': return "We’re reviewing your STL and preparing a quote.";
      case 'quoted': return "Your quote is ready. Complete payment to start printing.";
      case 'paid': return "Payment received. Your order is now in process.";
      case 'rejected': return "This file could not be quoted. Please upload a corrected file.";
      default: return "";
    }
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
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden pb-24 font-sans text-[#1E293B]">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* NAVBAR */}
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
            <Link href="/dashboard" className="text-sm font-medium text-blue-600 font-bold transition-colors">Dashboard</Link>
            <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Orders</Link>
            <Link href="/upload" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Upload</Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-semibold text-slate-600">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-32 px-6 max-w-6xl mx-auto space-y-10">
        
        {/* Header & Upload CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-2 tracking-tight flex items-center gap-3">
              Customer Dashboard
            </h1>
            <p className="text-slate-500 text-lg">Manage your 3D printing uploads and active orders.</p>
          </div>
          <Link href="/upload"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-violet-600 to-blue-600 w-full md:w-auto"
          >
            <UploadCloud className="w-5 h-5" /> Upload New STL
          </Link>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"><UploadCloud className="w-4 h-4 text-slate-400" /> Total Uploads</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">{totalUploads}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"><FileClock className="w-4 h-4 text-yellow-500" /> Pending Quotes</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">{pendingCount}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-500" /> Waiting Queue</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">{waitingCount}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"><Package className="w-4 h-4 text-blue-500" /> In Progress</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">{inProgressOrders}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">{completedOrders}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-10">
            {/* UPLOADS SECTION */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0F172A] border-b border-slate-200 pb-2">Your Uploads</h2>

              {uploads.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">No uploads yet</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">Upload your first STL file to get a quote and start printing.</p>
                  <Link href="/upload" className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-block">Upload STL</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h3 className="font-bold text-[#0F172A] text-lg mb-1">{upload.file_name}</h3>
                          <div className="flex gap-3 text-sm text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{upload.material}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">Qty: {upload.quantity}</span>
                            <span className="text-xs text-slate-400 flex items-center">{formatDate(upload.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${uploadStatusBadge(upload.status)}`}>
                            {upload.status.toUpperCase()}
                          </span>
                          {upload.status === "quoted" && upload.price_quoted && (
                            <span className="text-xl font-extrabold text-[#0F172A]">₹{upload.price_quoted}</span>
                          )}
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border flex items-start gap-3 text-sm font-medium ${
                        upload.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-800' : 
                        upload.status === 'quoted' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                        upload.status === 'paid' ? 'bg-green-50 border-green-100 text-green-800' :
                        'bg-slate-50 border-slate-100 text-slate-700'
                      }`}>
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="flex-1">{uploadStatusExplanation(upload.status)}</span>
                      </div>

                      <div className="flex justify-end mt-2">
                        {upload.status === "quoted" && (
                          <Link href={`/checkout?upload_id=${upload.id}&amount=${upload.price_quoted}`}>
                            <button className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 hover:-translate-y-0.5 transition-all text-sm w-full sm:w-auto">
                              Pay Now
                            </button>
                          </Link>
                        )}
                        {upload.status === "rejected" && (
                          <Link href="/upload">
                            <button className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-all w-full sm:w-auto">
                              Re-upload File
                            </button>
                          </Link>
                        )}
                        {upload.status === "waiting" && (
                          <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl flex items-center gap-2">
                            <Clock className="w-4 h-4" /> View Queue Info
                          </span>
                        )}
                        {upload.status === "pending" && (
                          <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-4 py-2 rounded-xl flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Awaiting Quote
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ORDERS SECTION */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0F172A] border-b border-slate-200 pb-2">Your Orders</h2>

              {orders.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">No orders yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Orders will appear here automatically after you complete a payment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 lg:p-8 hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                          <p className="font-bold text-[#0F172A] text-xl mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-slate-500 text-sm font-medium"><Clock className="w-4 h-4 inline-block mr-1 mb-0.5"/> {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${orderStatusBadge(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="text-2xl font-extrabold text-[#0F172A]">₹{order.total_amount}</span>
                        </div>
                      </div>

                      {/* Order Progress Timeline */}
                      {order.status !== 'cancelled' && (
                        <div className="mt-4 pt-6 border-t border-slate-100 overflow-x-auto pb-4">
                          <div className="flex items-start justify-between min-w-[500px]">
                            {ORDER_STEPS.map((step, i) => {
                              const currentIndex = getStepIndex(order.status);
                              const isCompleted = i <= currentIndex;
                              const isCurrent = i === currentIndex;
                              const stepLabels = {
                                "confirmed": "Confirmed",
                                "queued": "Queued",
                                "printing": "Printing",
                                "quality_check": "Quality Check",
                                "shipped": "Shipped",
                                "delivered": "Delivered"
                              };
                              return (
                                <div key={step} className="flex flex-col items-center flex-1 relative">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200'} ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                  </div>
                                  <span className={`text-[11px] font-bold mt-2 text-center ${isCompleted ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                                    {stepLabels[step as keyof typeof stepLabels]}
                                  </span>
                                  {i < ORDER_STEPS.length - 1 && (
                                    <div className={`absolute top-3 left-1/2 w-full h-1 -z-0 ${i < currentIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* DELIVERY EXPECTATION CARD */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none" />
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-violet-400" /> How It Works
              </h2>
              <div className="space-y-4 text-sm text-slate-300 font-medium">
                <p>We operate with limited daily print slots to maintain exceptional quality for every customer.</p>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-white font-bold mb-2 text-xs uppercase tracking-widest text-slate-400">Production Flow:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-violet-400"/> Queue & Preparation</li>
                    <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-violet-400"/> Active Printing</li>
                    <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-violet-400"/> Quality Check</li>
                    <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-violet-400"/> Shipping & Delivery</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SUPPORT CARD */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                Need Help?
              </h2>
              <p className="text-sm text-slate-500 mb-6 font-medium">Have questions about your STL file, quote, or order progress?</p>
              
              <div className="space-y-3">
                <button onClick={() => window.open('https://wa.me/917972740201', '_blank')} className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold transition-colors shadow-sm">
                  <MessageCircle className="w-5 h-5" /> WhatsApp Support
                </button>
                <button onClick={() => window.open('mailto:support@powerlay.com')} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors shadow-sm">
                  <Mail className="w-5 h-5" /> Email Support
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
