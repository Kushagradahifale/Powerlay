"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl animate-blob" />
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED] relative z-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full filter blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl z-0" />
      
      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Your Orders</h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl text-sm border-2 border-slate-200 text-[#0F172A] hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
          >
            🏠 Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl text-sm border-2 border-slate-200 text-[#0F172A] hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-purple-50/50 transition-all duration-300"
          >
            ← Dashboard
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-2xl text-sm text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
          >
            ⬆️ Upload New File
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="glass-card card-shadow border border-slate-200/60 rounded-3xl p-16 text-center">
            <p className="text-[#0F172A] text-xl font-bold mb-3">No orders yet</p>
            <p className="text-[#64748B] text-base mb-8">Orders will appear here after you make a payment</p>
            <a href="/upload" 
               className="inline-flex items-center text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
               style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
              Upload Your First File
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-card card-shadow border border-slate-200/60 rounded-2xl p-6 hover:card-shadow-hover transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#0F172A] text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[#64748B] text-sm mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0F172A] text-xl mb-2">₹{order.total_amount}</p>
                    <span className={`text-xs px-3 py-1 rounded-md font-semibold ${order.status === "delivered" ? "bg-green-100 text-green-800 border border-green-300" :
                      order.status === "shipped" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                        order.status === "printing" ? "bg-purple-100 text-purple-800 border border-purple-300" :
                          order.status === "confirmed" ? "bg-indigo-100 text-indigo-800 border border-indigo-300" :
                            "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      }`}>{order.status}</span>
                  </div>
                </div>
                {order.tracking_number && (
                  <p className="text-sm text-[#64748B] mt-4 pt-3 border-t border-slate-100">Tracking: <span className="font-medium text-[#0F172A]">{order.tracking_number}</span></p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
