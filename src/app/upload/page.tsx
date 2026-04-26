"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  UploadCloud,
  File,
  Hexagon,
  Cpu,
  Wrench,
  Sparkles,
  Box,
  GraduationCap,
  CreditCard,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Home,
  LayoutDashboard,
  ListOrdered,
  Upload,
  CheckCircle2,
} from "lucide-react";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [material, setMaterial] = useState("PLA");
  const [color, setColor] = useState("White");
  const [quantity, setQuantity] = useState(1);
  const [infill, setInfill] = useState(20);
  const [notes, setNotes] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selected: File) => {
    if (!selected.name.toLowerCase().endsWith(".stl")) {
      toast.error("Only .stl files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    validateAndSetFile(selected);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
    if (!selected) return;
    validateAndSetFile(selected);
  }, []);

  const [activeCount, setActiveCount] = useState(0);
  const DAILY_LIMIT = 5;
  const isFullCapacity = activeCount >= DAILY_LIMIT;

  useEffect(() => {
    const checkCapacity = async () => {
      const [ordersRes, uploadsRes] = await Promise.all([
        supabase.from("orders").select("id").in("status", ["confirmed", "queued", "printing", "quality_check"]),
        supabase.from("uploads").select("id").in("status", ["pending", "quoted"])
      ]);
      const activeO = ordersRes.data?.length || 0;
      const activeU = uploadsRes.data?.length || 0;
      setActiveCount(activeO + activeU);
    };
    
    checkCapacity();
    const interval = setInterval(checkCapacity, 5000);

    return () => clearInterval(interval);
  }, []);

  const materialRate = material === "PLA" ? 6 : 8;
  const estimatedWeight = 40 * (infill / 20);
  const cost = estimatedWeight * materialRate * quantity;
  const minCost = Math.max(cost, 149);
  const estimatedTotal = minCost + 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFullCapacity) {
      toast.error("We are fully booked today. Please try again later or contact us on WhatsApp.");
      return;
    }

    if (quantity > 5) {
      toast.error("Maximum quantity is 5 per order for now.");
      return;
    }

    if (!file) {
      toast.error("Please select an STL file to upload.");
      return;
    }

    try {
      setUploading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("You must be logged in to upload files.");
        setUploading(false);
        return;
      }

      // Upload file to Supabase Storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("stl-files")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const {
        data: { publicUrl: file_url },
      } = supabase.storage.from("stl-files").getPublicUrl(filePath);

      // Insert record into uploads table
      const { error: insertError } = await supabase.from("uploads").insert({
        user_id: user.id,
        file_name: file.name,
        file_url,
        file_size_mb: (file.size / 1048576).toFixed(2),
        material,
        color,
        quantity,
        infill_percent: infill,
        notes,
        status: "pending",
      });

      if (insertError) {
        throw insertError;
      }

      toast.success(
        "File submitted! We will review and send you a quote within 24 hours."
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#1E293B] relative overflow-x-hidden font-sans pb-24">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* FLOATING NAVBAR */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-300">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl px-6 py-4 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_25px_rgba(124,58,237,0.25)] group-hover:scale-105">
              <img
                src="/logo-icon.png"
                alt="Powerlay"
                className="h-6 md:h-7 w-auto object-contain"
              />
            </div>

            <span className="font-bold text-xl tracking-tight text-[#0F172A] group-hover:text-[#7C3AED] transition-colors duration-300">
              POWERLAY
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" /> Home
            </Link>

            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>

            <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4" /> Orders
            </Link>
          </div>

          <Link
            href="/upload"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Link>

        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">
              Upload → Quote → Print → Deliver
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] mb-4 tracking-tight"
          >
            Upload Your <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600">
              3D Model
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg"
          >
            Upload your STL file and get a quote within 24 hours. Premium quality FDM printing delivered to your door.
          </motion.p>
        </div>

        {isFullCapacity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
              <div className="text-left">
                <h3 className="text-red-800 font-bold text-lg mb-1">
                  ⚠️ We are fully booked today.
                </h3>
                <p className="text-red-600 font-medium">
                  Please try again tomorrow. Our printers are currently at maximum capacity.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* LEFT: FORM STEPS */}
          <div className="space-y-6">
            {/* Step 1: Upload STL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <h2 className="text-xl font-bold text-[#0F172A]">Upload STL</h2>
              </div>

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[240px]
                ${isDragging
                    ? "border-violet-500 bg-violet-50/50"
                    : file
                      ? "border-blue-200 bg-blue-50/30 hover:border-blue-300"
                      : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
                  }
              `}
              >
                <input
                  ref={fileInputRef}
                  id="stl-file"
                  type="file"
                  accept=".stl"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!file ? (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-400">
                      <UploadCloud className="w-8 h-8 text-violet-500" />
                    </div>
                    <p className="text-[#0F172A] font-semibold text-lg mb-1">
                      Drag & drop your STL file
                    </p>
                    <p className="text-sm text-slate-500">
                      or click to browse from your computer
                    </p>
                    <p className="text-xs text-slate-400 mt-4">
                      Maximum file size: 50MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <File className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-[#0F172A] font-semibold text-lg mb-1 truncate max-w-[250px] sm:max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {(file.size / 1048576).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-blue-600 mt-4 font-medium hover:underline">
                      Click to change file
                    </p>
                  </>
                )}
              </div>
            </motion.div>

            {/* Step 2: Choose Material */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Choose Material
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">
                    Material Type
                  </Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl text-[#0F172A] focus:ring-violet-500">
                      <SelectValue placeholder="Select Material" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-slate-200">
                      <SelectItem value="PLA" className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">PLA</span>
                          <span className="text-xs text-slate-500">
                            Standard, Easy to print
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PETG" className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">PETG</span>
                          <span className="text-xs text-slate-500">
                            Strong, Heat resistant
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-input" className="text-slate-700 font-semibold">
                    Color Preference
                  </Label>
                  <Input
                    id="color-input"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. White, Black, Red"
                    className="h-12 bg-slate-50 border-slate-200 text-[#0F172A] rounded-xl focus-visible:ring-violet-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Step 3: Customize Print */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Customize Print
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-700 font-semibold">
                      Infill Density
                    </Label>
                    <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md">
                      {infill}%
                    </span>
                  </div>
                  <div className="pt-2">
                    <Slider
                      min={10}
                      max={100}
                      step={5}
                      value={[infill]}
                      onValueChange={(val) => setInfill(val[0])}
                      className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-violet-500 [&_[role=slider]]:bg-white [&_.relative]:bg-slate-200 [&_[data-orientation=horizontal]>div]:bg-violet-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Higher infill = stronger but heavier & more expensive part.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity-input" className="text-slate-700 font-semibold">
                    Quantity
                  </Label>
                  <Input
                    id="quantity-input"
                    type="number"
                    min={1}
                    max={5}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(5, Number(e.target.value))))
                    }
                    className="h-12 bg-slate-50 border-slate-200 text-[#0F172A] rounded-xl focus-visible:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes-input" className="text-slate-700 font-semibold">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific tolerances, orientation requests, or intended usage..."
                  className="bg-slate-50 border-slate-200 text-[#0F172A] rounded-xl focus-visible:ring-violet-500 min-h-[120px] resize-y"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: ESTIMATE & SUBMIT */}
          <div className="lg:sticky lg:top-28 space-y-6">
            {/* Step 4: Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 relative overflow-hidden"
            >
              {/* Decorative gradient top edge */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-blue-500" />

              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  Estimated Price
                </h3>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 space-y-4">

                {/* Material */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Material</span>
                  <span className="font-semibold text-[#0F172A]">
                    {material}
                  </span>
                </div>

                {/* Base Rate */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Base Rate</span>
                  <span className="font-semibold text-[#0F172A]">
                    {material === "PLA" ? "₹6/g" : "₹8/g"}
                  </span>
                </div>

                {/* Minimum */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Minimum Order</span>
                  <span className="font-semibold text-[#0F172A]">₹149</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Estimated Shipping</span>
                  <span className="font-semibold text-[#0F172A]">₹60</span>
                </div>

                <div className="h-px w-full bg-slate-200 my-2" />

                {/* 🔥 Estimated Range (IMPORTANT UX) */}
                <div className="flex justify-between items-center">
                  <span className="text-[#0F172A] font-bold">
                    Estimated Total
                  </span>
                  <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    ~₹{Math.round(estimatedTotal)}
                  </span>
                </div>

                {/* Smart Explanation */}
                <p className="text-xs text-slate-500">
                  Final price after file review. Based on estimated {Math.round(estimatedWeight)}g weight.
                </p>

                {/* Info Box */}
                <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Final price confirmed after file review.</strong>
                    You will receive an exact quote within 24 hours.
                  </p>
                </div>

              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>No payment required right now</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  <span>Secure file handling & privacy</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || isFullCapacity}
                className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity" />
                <div className="relative bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0">
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-white font-bold text-lg tracking-wide">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-bold text-lg tracking-wide">
                        Submit for Quote
                      </span>
                      <svg
                        className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </motion.div>
          </div>
        </form>

        {/* USE CASES SECTION (Replaces Example Prints) */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
              Perfect For Any Project
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From functional engineering parts to highly detailed miniatures, we print it all with precision.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { title: "Functional Prototype", icon: Cpu, color: "text-blue-500", bg: "bg-blue-50" },
              { title: "Engineering Part", icon: Wrench, color: "text-orange-500", bg: "bg-orange-50" },
              { title: "Miniature", icon: Sparkles, color: "text-violet-500", bg: "bg-violet-50" },
              { title: "Enclosure", icon: Box, color: "text-emerald-500", bg: "bg-emerald-50" },
              { title: "College Project", icon: GraduationCap, color: "text-pink-500", bg: "bg-pink-50" },
              { title: "Custom Object", icon: Hexagon, color: "text-indigo-500", bg: "bg-indigo-50" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-[#0F172A] font-bold text-lg">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div className="mt-32 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
              How It Works
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A seamless process from digital file to physical object in your hands.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 z-0" />

            {[
              { step: 1, title: "Upload STL", desc: "Drag and drop your 3D design file." },
              { step: 2, title: "Choose Material", desc: "Select PLA or PETG and settings." },
              { step: 3, title: "We Review & Quote", desc: "Get an accurate price in 24 hours." },
              { step: 4, title: "You Approve & We Print", desc: "Pay securely and we start printing." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600">
                      {item.step}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm max-w-[200px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}