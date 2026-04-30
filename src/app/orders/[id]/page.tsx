"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Search,
  User,
  MapPin,
  Phone,
  IndianRupee,
  Calendar,
  MessageCircle,
  Mail,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileText
} from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  upload_id: string | null;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

interface Upload {
  id: string;
  file_name: string;
  material: string;
  quantity: number;
  infill_percent: number;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

const STEP_ORDER = ["confirmed", "queued", "printing", "quality_check", "shipped", "delivered"] as const;

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError || !orderData) {
        router.push("/orders");
        return;
      }

      // Security check
      if (orderData.user_id !== user.id) {
        router.push("/orders");
        return;
      }

      setOrder(orderData);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      // Fetch Upload if available
      if (orderData.upload_id) {
        const { data: uploadData } = await supabase
          .from("uploads")
          .select("id, file_name, material, quantity, infill_percent")
          .eq("id", orderData.upload_id)
          .single();
        
        setUpload(uploadData);
      }

      setLoading(false);
    };

    fetchOrderData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED]" />
      </div>
    );
  }

  if (!order) return null;

  const currentIdx = STEP_ORDER.indexOf(order.status as any);

  const getStatusExplanation = (status: string) => {
    switch (status) {
      case "confirmed": return "Your order is confirmed and will be queued soon.";
      case "queued": return "Your print is waiting for printer availability.";
      case "printing": return "Your 3D print is currently being printed.";
      case "quality_check": return "We are checking print quality before dispatch.";
      case "shipped": return "Your order has been shipped.";
      case "delivered": return "Your order has been delivered.";
      case "cancelled": return "This order was cancelled.";
      default: return "Order status updated.";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans pb-24 text-[#1E293B]">
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
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/orders" className="text-sm font-medium text-blue-600 font-bold transition-colors">Orders</Link>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 text-slate-900 text-sm font-bold px-4 py-2 rounded-xl">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Order Details</span>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-32 px-6 max-w-6xl mx-auto space-y-8">
        <div>
          <Link href="/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold text-sm mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-2xl font-extrabold text-[#0F172A]">₹{order.total_amount}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-sm font-bold shadow-sm ${
                order.status === 'delivered' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                order.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-700' :
                'bg-blue-50 border-blue-100 text-blue-700'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* ORDER PROGRESS TIMELINE */}
        {order.status !== 'cancelled' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-8">Order Progress</h2>
            <div className="relative">
              <div className="flex items-start justify-between overflow-x-auto pb-4 gap-4">
                {STEP_ORDER.map((step, i) => {
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  const stepLabels: Record<string, string> = {
                    "confirmed": "Confirmed",
                    "queued": "Queued",
                    "printing": "Printing",
                    "quality_check": "Quality Check",
                    "shipped": "Shipped",
                    "delivered": "Delivered"
                  };
                  const stepIcons: Record<string, any> = {
                    "confirmed": CheckCircle2,
                    "queued": Clock,
                    "printing": Printer,
                    "quality_check": Search,
                    "shipped": Truck,
                    "delivered": Package
                  };
                  const StepIcon = stepIcons[step];

                  return (
                    <div key={step} className="flex flex-col items-center flex-1 min-w-[100px] relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-bold mt-3 text-center ${isCompleted ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                        {stepLabels[step]}
                      </span>
                      {i < STEP_ORDER.length - 1 && (
                        <div className={`absolute top-6 left-1/2 w-full h-1 -z-0 ${i < currentIdx ? 'bg-green-500' : 'bg-slate-100'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-violet-50 border border-violet-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-violet-100 shadow-sm">
                <Info className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-900 mb-1">What happens next?</p>
                <p className="text-sm text-violet-700 font-medium">{getStatusExplanation(order.status)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* PRODUCT DETAILS */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-500" /> Item Details
              </h2>
              {upload ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A]">{upload.file_name}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{upload.material} • {upload.quantity} Units</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Infill</p>
                        <p className="text-sm font-bold text-[#0F172A]">{upload.infill_percent}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <p className="text-sm font-bold text-green-600">Active</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.tracking_number && (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2">
                          <Truck className="w-5 h-5" /> Shipping Information
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                        <div>
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Carrier</p>
                          <p className="font-bold text-blue-900">Standard Delivery</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Tracking ID</p>
                          <p className="font-bold text-blue-900 flex items-center gap-2">
                            {order.tracking_number}
                            <button className="p-1 hover:bg-blue-100 rounded-md transition-colors">
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 italic">
                  Upload information is being updated.
                </div>
              )}
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-500" /> Delivery Details
              </h2>
              {profile ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="font-bold text-[#0F172A]">{profile.full_name || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                        <p className="font-bold text-[#0F172A]">{profile.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Address</p>
                        <p className="font-bold text-[#0F172A] leading-relaxed">
                          {profile.address}<br />
                          {profile.city}, {profile.state} - {profile.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 italic">
                  Delivery information not available.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* PRICE SUMMARY */}
            <div className="bg-[#0F172A] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none" />
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                <IndianRupee className="w-5 h-5 text-violet-400" /> Price Summary
              </h2>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white">₹{order.total_amount - 60}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Shipping</span>
                  <span className="text-white">₹60</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="text-2xl font-extrabold text-white">₹{order.total_amount}</span>
                </div>
                <div className="mt-6 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Secured</span>
                </div>
              </div>
            </div>

            {/* SUPPORT CARD */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Need help?</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                Have questions about this specific order or want to discuss print modifications?
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => window.open(`https://wa.me/918462831438?text=Hi Powerlay, I need help with Order ID: ${order.id}`, '_blank')} 
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp Support
                </button>
                <button 
                  onClick={() => window.open(`mailto:Powerlayofficial@gmail.com?subject=Support needed for Powerlay Order ${order.id}`)} 
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <Mail className="w-5 h-5" /> Email Support
                </button>
              </div>
            </div>

            {/* ORDER POLICY CARD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 -translate-y-10 translate-x-10 rounded-full" />
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4 relative z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Order Policy
              </h3>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Status updates are shown in real-time on this page.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Tracking details appear automatically after dispatch.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Delivery time varies based on current printer load.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Contact support if delivery details are missing.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
