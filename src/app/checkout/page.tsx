"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Upload {
  id: string;
  file_name: string;
  material: string;
  quantity: number;
  infill_percent: number;
  price_quoted: number;
  status: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadId = searchParams.get("upload_id");
  const amountParam = searchParams.get("amount");

  const [upload, setUpload] = useState<Upload | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const baseCost = amountParam ? parseFloat(amountParam) : 0;
  const gst = Math.round(baseCost * 0.18 * 100) / 100;
  const shipping = 60;
  const total = Math.round((baseCost + gst + shipping) * 100) / 100;

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? "");

      if (!uploadId) {
        toast.error("No upload specified");
        router.push("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", uploadId)
        .single();

      if (error || !data) {
        toast.error("Upload not found");
        router.push("/dashboard");
        return;
      }

      setUpload(data);
      setLoading(false);
    };

    init();
  }, [router, uploadId]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPaying(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway. Please try again.");
      setPaying(false);
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, upload_id: uploadId }),
      });

      const data = await res.json();

      if (!data.orderId) {
        toast.error("Failed to create payment order");
        setPaying(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Powerlay",
        description: "3D Print Order",
        order_id: data.orderId,
        prefill: {
          name: userEmail,
          email: userEmail,
        },
        theme: {
          color: "#febd69",
        },
        handler: async (response: any) => {
          // Insert order
          const { error: orderError } = await supabase.from("orders").insert({
            user_id: userId,
            upload_id: uploadId,
            total_amount: total,
            status: "confirmed",
            payment_id: response.razorpay_payment_id,
            payment_status: "paid",
          });

          if (orderError) {
            toast.error("Payment received but failed to save order. Contact support.");
            setPaying(false);
            return;
          }

          // Update upload status to paid
          await supabase
            .from("uploads")
            .update({ status: "paid" })
            .eq("id", uploadId);

          setSuccess(true);
          toast.success("Payment successful! Your order has been placed.");

          setTimeout(() => {
            router.push("/orders");
          }, 2000);
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#febd69] border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-10 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Payment</h1>

        {/* Upload Details Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h2>

          {upload && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">File</span>
                <span className="text-gray-900 font-medium">{upload.file_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Material</span>
                <span className="text-gray-900 font-medium">{upload.material}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity</span>
                <span className="text-gray-900 font-medium">{upload.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Infill</span>
                <span className="text-gray-900 font-medium">{upload.infill_percent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quoted Price</span>
                <span className="text-gray-900 font-bold">₹{baseCost}</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Price Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Print Cost</span>
              <span className="text-gray-900">₹{baseCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST (18%)</span>
              <span className="text-gray-900">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900">₹{shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-bold text-gray-900 text-lg">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Secure Payment Badge */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
          <span>🔒</span>
          <span>Secured by Razorpay</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition"
          style={{ background: "#febd69", color: "#131921" }}
        >
          {paying ? "Processing..." : `Pay Now ₹${total.toFixed(2)}`}
        </button>

        {/* Back Link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-center text-gray-500 text-sm mt-4 hover:text-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
