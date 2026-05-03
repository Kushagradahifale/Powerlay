"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import {
  Shield,
  Eye,
  CheckCircle2,
  Truck,
  AlertTriangle,
  ArrowLeft,
  PartyPopper,
  ExternalLink,
  MessageCircle,
  Mail,
  Package,
  CreditCard,
  User,
  Info,
} from "lucide-react";

interface Upload {
  id: string;
  file_name: string;
  material: string;
  quantity: number;
  infill_percent: number;
  price_quoted: number;
  status: string;
}

interface Profile {
  phone: string;
  address: string;
  full_name: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

import { Suspense } from "react";

/* ─────────────────────────────────────────────
   Trust Badge Component
   ───────────────────────────────────────────── */
function TrustBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-slate-200/70 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="shrink-0">{icon}</div>
      <span className="text-xs font-semibold text-slate-600 leading-tight">
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Confetti Particle Component
   ───────────────────────────────────────────── */
function ConfettiParticle({ delay, left }: { delay: number; left: number }) {
  const colors = ["#7C3AED", "#2563EB", "#10B981", "#F59E0B", "#EC4899"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <div
      className="absolute w-2 h-2 rounded-full opacity-0"
      style={{
        left: `${left}%`,
        top: "-10px",
        backgroundColor: color,
        animation: `confettiFall 2.5s ease-out ${delay}s forwards`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Main Checkout Content
   ───────────────────────────────────────────── */
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
  const [profileWarning, setProfileWarning] = useState(false);

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

      // Check profile completeness
      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone, address, full_name")
        .eq("id", user.id)
        .single();

      if (
        profileData &&
        (!profileData.phone || !profileData.address)
      ) {
        setProfileWarning(true);
      }

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
          }, 4000);
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

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200/30 rounded-full filter blur-3xl animate-blob z-0" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 z-0" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED]" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">
            Preparing your checkout…
          </p>
        </div>
      </div>
    );
  }

  /* ── SUCCESS STATE ── */
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 z-0" />

        {/* Confetti */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={Math.random() * 1.5}
              left={Math.random() * 100}
            />
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl card-shadow p-10 md:p-14 text-center max-w-lg w-[90%] border border-slate-200/60 relative z-20">
          {/* Celebration Icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3 tracking-tight">
            Payment Successful!
          </h2>
          <p className="text-slate-500 text-lg mb-2">
            Your order has been confirmed.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Redirecting to your orders in a few seconds…
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
            <div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                animation: "progressFill 4s linear forwards",
              }}
            />
          </div>

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 font-bold text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)" }}
          >
            <Package className="w-5 h-5" />
            View My Orders
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Inline keyframes for success animations */}
        <style>{`
          @keyframes confettiFall {
            0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
            100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.3); }
          }
          @keyframes progressFill {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  /* ── MAIN CHECKOUT ── */
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 relative z-10">
        {/* Back navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold text-sm mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
            <CreditCard className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">
              Secure Checkout
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Complete Your Payment
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Review your order details and pay securely with Razorpay.
          </p>
        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <TrustBadge
            icon={<Shield className="w-4 h-4 text-green-600" />}
            label="Secured by Razorpay"
          />
          <TrustBadge
            icon={<Eye className="w-4 h-4 text-blue-600" />}
            label="No Hidden Charges"
          />
          <TrustBadge
            icon={<CheckCircle2 className="w-4 h-4 text-violet-600" />}
            label="Final Quote Approved"
          />
          <TrustBadge
            icon={<Truck className="w-4 h-4 text-amber-600" />}
            label="Order Tracking After Payment"
          />
        </div>

        {/* Profile Warning */}
        {profileWarning && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-50 border border-amber-200/80 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Complete your profile for smoother delivery
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Phone or address is missing. This won't block payment.
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                Update Profile
              </Link>
            </div>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* LEFT — Order Summary */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8">
              <h2 className="font-bold text-[#0F172A] mb-6 text-xl flex items-center gap-2.5">
                <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#7C3AED]" />
                </div>
                Order Summary
              </h2>

              {upload && (
                <div className="space-y-0">
                  {/* File Name Row */}
                  <div className="flex justify-between items-center text-base py-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">File</span>
                    <span className="text-[#0F172A] font-semibold text-right max-w-[60%] truncate">
                      {upload.file_name}
                    </span>
                  </div>
                  {/* Material Row */}
                  <div className="flex justify-between items-center text-base py-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Material</span>
                    <span className="text-[#0F172A] font-semibold capitalize">
                      {upload.material}
                    </span>
                  </div>
                  {/* Quantity Row */}
                  <div className="flex justify-between items-center text-base py-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Quantity</span>
                    <span className="text-[#0F172A] font-semibold">
                      {upload.quantity}
                    </span>
                  </div>
                  {/* Infill Row */}
                  <div className="flex justify-between items-center text-base py-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Infill</span>
                    <span className="text-[#0F172A] font-semibold">
                      {upload.infill_percent}%
                    </span>
                  </div>
                  {/* Status Row */}
                  <div className="flex justify-between items-center text-base py-4">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Quoted
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Support Mini-Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8">
              <h3 className="font-bold text-[#0F172A] mb-4 text-base flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Need Help?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://wa.me/919XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200/70 rounded-2xl px-4 py-3.5 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-sm shadow-green-200 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      WhatsApp Support
                    </p>
                    <p className="text-xs text-green-600">Quick response</p>
                  </div>
                </a>
                <a
                  href="mailto:support@powerlay.in"
                  className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 rounded-2xl px-4 py-3.5 transition-colors group"
                >
                  <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200 group-hover:scale-105 transition-transform">
                    <Mail className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-800">
                      Email Support
                    </p>
                    <p className="text-xs text-blue-600">
                      support@powerlay.in
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — Payment Summary Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-lg p-6 md:p-8">
                <h2 className="font-bold text-[#0F172A] mb-6 text-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  Payment Summary
                </h2>

                {/* Pricing Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-base">
                    <span className="text-slate-500 font-medium">
                      Final Quoted Amount
                    </span>
                    <span className="text-[#0F172A] font-semibold">
                      ₹{quotedAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-baseline">
                    <span className="font-bold text-[#0F172A] text-lg">
                      Total Payable
                    </span>
                    <span className="font-extrabold text-3xl gradient-text">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Transparency Note */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-600">
                      Transparent Pricing:
                    </span>{" "}
                    Admin-reviewed final price. No automatic GST or hidden
                    charges added here. What you see is what you pay.
                  </p>
                </div>

                {/* Razorpay Badge */}
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-6 bg-slate-50 py-2.5 px-4 rounded-full border border-slate-100 w-fit mx-auto">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-semibold">
                    256-bit SSL · Secured by Razorpay
                  </span>
                </div>

                {/* Pay Button */}
                <button
                  id="pay-now-button"
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-purple-200/60 hover:shadow-xl hover:shadow-purple-300/60 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                  }}
                >
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay Now ₹{total.toFixed(2)}
                    </span>
                  )}
                </button>

                {/* Back Link */}
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-center text-slate-400 font-medium text-sm mt-4 hover:text-[#7C3AED] transition-colors cursor-pointer"
                >
                  ← Cancel & go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#7C3AED]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
