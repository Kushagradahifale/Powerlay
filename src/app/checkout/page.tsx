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

import { Suspense } from "react";

function CheckoutContent() {
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

  const quotedAmount = amountParam ? parseFloat(amountParam) : 0;
  const total = Math.round(quotedAmount * 100) / 100;

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
          color: "#7C3AED",
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl animate-blob z-0" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 z-0" />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED] relative z-10" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 z-0" />
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl card-shadow p-10 text-center max-w-md border border-slate-200/60 relative z-10">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Payment Successful!</h2>
          <p className="text-[#64748B] text-lg">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full filter blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl z-0" />

      <div className="max-w-lg mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
            <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Checkout</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Complete Your Payment</h1>
        </div>

        <div className="glass-card card-shadow rounded-3xl p-8 mb-6 border border-slate-200/80">
          <h2 className="font-bold text-[#0F172A] mb-5 text-xl flex items-center gap-2">
            <span>📦</span> Order Summary
          </h2>

          {upload && (
            <div className="space-y-4">
              <div className="flex justify-between text-base border-b border-slate-100 pb-3">
                <span className="text-[#64748B]">File</span>
                <span className="text-[#0F172A] font-medium">{upload.file_name}</span>
              </div>
              <div className="flex justify-between text-base border-b border-slate-100 pb-3">
                <span className="text-[#64748B]">Material</span>
                <span className="text-[#0F172A] font-medium">{upload.material}</span>
              </div>
              <div className="flex justify-between text-base border-b border-slate-100 pb-3">
                <span className="text-[#64748B]">Quantity</span>
                <span className="text-[#0F172A] font-medium">{upload.quantity}</span>
              </div>
              <div className="flex justify-between text-base border-b border-slate-100 pb-3">
                <span className="text-[#64748B]">Infill</span>
                <span className="text-[#0F172A] font-medium">{upload.infill_percent}%</span>
              </div>
              <div className="flex justify-between text-base pt-1">
                <span className="text-[#64748B]">Quoted Price</span>
                <span className="text-[#0F172A] font-bold">₹{quotedAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown Card */}
        <div className="bg-gradient-to-br from-slate-50 to-purple-50/50 rounded-3xl p-8 mb-8 border border-purple-100 card-shadow">
          <h2 className="font-bold text-[#0F172A] mb-5 text-xl">Price Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-base">
              <span className="text-[#64748B]">Final Quoted Amount</span>
              <span className="text-[#0F172A] font-medium">₹{quotedAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-4 mt-2 flex justify-between items-center">
              <span className="font-bold text-[#0F172A] text-lg">Total</span>
              <span className="font-bold text-3xl gradient-text">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Secure Payment Badge */}
        <div className="flex items-center justify-center gap-2 text-[#64748B] text-sm mb-6 bg-slate-100/50 py-2 px-4 rounded-full w-fit mx-auto">
          <span>🔒</span>
          <span>Secured by Razorpay</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all duration-300"
          style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)" }}
        >
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay Now ₹${total.toFixed(2)}`
          )}
        </button>

        {/* Back Link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-center text-[#64748B] font-medium text-sm mt-6 hover:text-[#7C3AED] transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED]" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
