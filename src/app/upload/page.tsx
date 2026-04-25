"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

export default function Home() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [material, setMaterial] = useState("PLA");
  const [color, setColor] = useState("White");
  const [quantity, setQuantity] = useState(1);
  const [infill, setInfill] = useState(20);
  const [notes, setNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".stl")) {
      toast.error("Only .stl files are allowed.");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full filter blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl z-0" />

      {/* MAIN UPLOAD CARD */}
      <div className="mt-8 flex justify-center relative z-10">
        <div className="glass-card card-shadow border border-slate-200/80 p-10 rounded-3xl text-center w-full max-w-xl">
          <h1 className="text-3xl font-bold mb-3 text-[#0F172A]">Upload Your Design</h1>
          <p className="mb-8 text-base text-[#64748B]">
            Upload your STL file to create your product
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* File Input */}
            <div>
              <Label htmlFor="stl-file" className="text-gray-700 mb-2">STL File</Label>
              <Input
                id="stl-file"
                type="file"
                accept=".stl"
                onChange={handleFileChange}
                className="bg-white/50 border border-slate-300 text-[#0F172A] rounded-xl cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-[#7C3AED] hover:file:bg-purple-100"
              />
              {file && (
                <p className="text-sm text-[#64748B] mt-2 font-medium">
                  📎 {file.name} — {(file.size / 1048576).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Material Select */}
            <div>
              <Label className="text-gray-700 mb-2">Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger className="bg-white/50 border border-slate-300 text-[#0F172A] rounded-xl w-full">
                  <SelectValue placeholder="Select Material" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 rounded-xl">
                  <SelectItem value="PLA" className="text-[#0F172A] hover:bg-slate-50 cursor-pointer">PLA</SelectItem>
                  <SelectItem value="PETG" className="text-[#0F172A] hover:bg-slate-50 cursor-pointer">PETG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Input */}
            <div>
              <Label htmlFor="color-input" className="text-gray-700 mb-2">Color</Label>
              <Input
                id="color-input"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. White, Black, Red"
                className="bg-white/50 border border-slate-300 text-[#0F172A] rounded-xl focus:ring-[#7C3AED] focus:border-[#7C3AED]"
              />
            </div>

            {/* Quantity Input */}
            <div>
              <Label htmlFor="quantity-input" className="text-gray-700 mb-2">Quantity</Label>
              <Input
                id="quantity-input"
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value))))}
                className="bg-white/50 border border-slate-300 text-[#0F172A] rounded-xl focus:ring-[#7C3AED] focus:border-[#7C3AED]"
              />
            </div>

            {/* Infill Slider */}
            <div>
              <Label className="text-gray-700 mb-2">Infill: {infill}%</Label>
              <div className="bg-slate-100 rounded-full p-2 mt-2">
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={[infill]}
                  onValueChange={(val) => setInfill(val[0])}
                />
              </div>
            </div>

            {/* Notes Textarea */}
            <div>
              <Label htmlFor="notes-input" className="text-gray-700 mb-2">Notes</Label>
              <Textarea
                id="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes..."
                className="bg-white/50 border border-slate-300 text-[#0F172A] rounded-xl placeholder:text-slate-400 focus:ring-[#7C3AED] focus:border-[#7C3AED] min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={uploading}
                className="w-full text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all duration-300 text-lg"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : "Upload Now"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* EXAMPLE PRINTS */}
      <div className="mt-20 max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#0F172A]">Example Prints</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {["Phone Stand", "Gear", "Miniature", "Mechanical Part", "Enclosure", "Custom Object"].map((item) => (
            <div key={item} className="border border-slate-200/60 p-5 rounded-3xl glass-card card-shadow hover:card-shadow-hover transition-all duration-300 group">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-purple-50 mb-4 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                  {item === "Phone Stand" && "📱"}
                  {item === "Gear" && "⚙️"}
                  {item === "Miniature" && "🎭"}
                  {item === "Mechanical Part" && "🔧"}
                  {item === "Enclosure" && "📦"}
                  {item === "Custom Object" && "✨"}
                </div>
              </div>
              <p className="text-[#0F172A] font-bold text-center">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="mt-20 max-w-4xl mx-auto mb-20 relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#0F172A]">How It Works</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {["Upload STL", "Choose Material", "We Print", "We Deliver"].map((step, idx) => (
            <div key={step} className="border border-slate-200/60 glass-card p-6 rounded-3xl text-center card-shadow hover:card-shadow-hover transition-all duration-300 relative">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7C3AED] font-bold flex items-center justify-center mx-auto mb-3 absolute -top-4 left-1/2 -translate-x-1/2 shadow-sm border border-white">
                {idx + 1}
              </div>
              <p className="text-[#0F172A] font-bold mt-2">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}