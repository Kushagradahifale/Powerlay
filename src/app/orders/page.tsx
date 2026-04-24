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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading orders...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>


        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-sm text-white"
            style={{ background: '#131921' }}
          >
            🏠 Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-sm border-2"
            style={{ borderColor: '#131921', color: '#131921' }}
          >
            ← Dashboard
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-sm"
            style={{ background: '#febd69', color: '#131921' }}
          >
            ⬆️ Upload New File
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">Orders will appear here after you make a payment</p>
            <a href="/upload" className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold px-6 py-3 rounded-lg">
              Upload Your First File
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">₹{order.total_amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === "delivered" ? "bg-green-100 text-green-800" :
                      order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "printing" ? "bg-purple-100 text-purple-800" :
                          order.status === "confirmed" ? "bg-indigo-100 text-indigo-800" :
                            "bg-yellow-100 text-yellow-800"
                      }`}>{order.status}</span>
                  </div>
                </div>
                {order.tracking_number && (
                  <p className="text-sm text-gray-500 mt-3">Tracking: {order.tracking_number}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
