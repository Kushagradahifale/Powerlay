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

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");

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
      setLoading(false);
    };

    init();
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
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#febd69] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Welcome, {userEmail}</h1>
          <button
            onClick={handleLogout}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Upload Button */}
        <div>
          <Link href="/upload" className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-black font-bold px-6 py-3 rounded-lg">
            + Upload New File
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#febd69]">
            <p className="text-gray-500 text-sm">Total Uploads</p>
            <p className="text-3xl font-bold text-gray-900">{totalUploads}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#febd69]">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#febd69]">
            <p className="text-gray-500 text-sm">Quoted</p>
            <p className="text-3xl font-bold text-gray-900">{quotedCount}</p>
          </div>
        </div>

        {/* Your Uploads */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Uploads</h2>

          {uploads.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">No uploads yet. Upload your first STL file!</div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
                >
                    <div>
                      <p className="font-bold text-gray-900">{upload.file_name}</p>
                      <p className="text-gray-500 text-sm">
                        {upload.material} &middot; Qty: {upload.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${uploadStatusBadge(upload.status)}`}>
                        {upload.status}
                      </span>

                      <span className="text-sm text-gray-600">
                        {upload.status === "quoted" && upload.price_quoted != null
                          ? `₹${upload.price_quoted}`
                          : "Awaiting quote"}
                      </span>

                      {upload.status === "quoted" && (
                        <Link href={`/checkout?upload_id=${upload.id}&amount=${upload.price_quoted}`}>
                          <button className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold px-4 py-2 rounded-lg text-sm">
                            Pay Now
                          </button>
                        </Link>
                      )}

                      {upload.status === "pending" && (
                        <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                          Awaiting Quote
                        </button>
                      )}

                      {upload.status === "rejected" && (
                        <Link href="/upload">
                          <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition">
                            Re-upload
                          </button>
                        </Link>
                      )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Orders */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Orders</h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">No orders yet. Orders will appear here after payment.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
                >
                    <div>
                      <p className="font-bold text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${orderStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{order.total_amount}
                      </span>
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
