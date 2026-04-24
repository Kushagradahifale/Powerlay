"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "quoted":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const totalUploads = uploads.length;
  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const quotedCount = uploads.filter((u) => u.status === "quoted").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#febd69] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="bg-[#131921] text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">Powerlay Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage customer uploads and send quotes</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#131921]">
            <p className="text-gray-500 text-sm">Total Uploads</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalUploads}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#131921]">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#131921]">
            <p className="text-gray-500 text-sm">Quoted</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{quotedCount}</p>
          </div>
        </div>

        {/* Uploads List */}
        <div className="space-y-4">
          {uploads.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-gray-400">No uploads yet</p>
            </div>
          ) : (
            uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-white rounded-xl shadow p-6 mb-4"
              >
                {/* Top Row: File name + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {upload.file_name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusBadge(upload.status)}`}
                  >
                    {upload.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Material</p>
                    <p className="text-gray-900 font-medium">{upload.material}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="text-gray-900 font-medium">{upload.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Infill</p>
                    <p className="text-gray-900 font-medium">{upload.infill_percent}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="text-gray-900 font-medium">{formatDate(upload.created_at)}</p>
                  </div>
                </div>

                {/* Notes */}
                {upload.notes && (
                  <div className="text-sm mb-3">
                    <p className="text-gray-500">Notes</p>
                    <p className="text-gray-700">{upload.notes}</p>
                  </div>
                )}

                {/* Download + Price + Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100">
                  {/* Download Link */}
                  <a
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download STL
                  </a>

                  {/* Current Price */}
                  {upload.price_quoted != null && (
                    <span className="text-sm font-medium text-gray-700">
                      Quoted: ₹{upload.price_quoted}
                    </span>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Actions (only for pending) */}
                  {upload.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Enter price in ₹"
                        value={prices[upload.id] ?? ""}
                        onChange={(e) =>
                          setPrices((prev) => ({
                            ...prev,
                            [upload.id]: e.target.value,
                          }))
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
                      />
                      <button
                        onClick={() => handleSendQuote(upload.id)}
                        disabled={actionLoading === upload.id}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Send Quote
                      </button>
                      <button
                        onClick={() => handleReject(upload.id)}
                        disabled={actionLoading === upload.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Reject
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
