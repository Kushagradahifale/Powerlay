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
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">

      {/* MAIN UPLOAD CARD */}
      <div className="mt-8 flex justify-center">
        <div className="bg-white border border-gray-200 p-10 rounded-xl text-center w-full max-w-xl shadow-sm">
          <h1 className="text-2xl font-bold mb-2 text-[#131921]">Upload Your Design</h1>
          <p className="mb-6 text-base text-gray-500">
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
                className="bg-white border border-gray-300 text-gray-900"
              />
              {file && (
                <p className="text-sm text-gray-500 mt-2">
                  📎 {file.name} — {(file.size / 1048576).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Material Select */}
            <div>
              <Label className="text-gray-700 mb-2">Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900 w-full">
                  <SelectValue placeholder="Select Material" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="PLA" className="text-gray-900 hover:bg-gray-50">PLA</SelectItem>
                  <SelectItem value="PETG" className="text-gray-900 hover:bg-gray-50">PETG</SelectItem>
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
                className="bg-white border border-gray-300 text-gray-900"
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
                className="bg-white border border-gray-300 text-gray-900"
              />
            </div>

            {/* Infill Slider */}
            <div>
              <Label className="text-gray-700 mb-2">Infill: {infill}%</Label>
              <div className="bg-gray-100 rounded-full p-1 mt-2">
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
                className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={uploading}
                className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-base"
              >
                {uploading ? "Uploading..." : "Upload Now"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* EXAMPLE PRINTS */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#131921]">Example Prints</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {["Phone Stand", "Gear", "Miniature", "Mechanical Part", "Enclosure", "Custom Object"].map((item) => (
            <div key={item} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
              <div className="h-28 bg-gray-100 mb-3 rounded-lg"></div>
              <p className="text-[#131921] font-medium text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="mt-16 max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-6 text-[#131921]">How It Works</h2>

        <div className="grid md:grid-cols-4 gap-4">
          {["Upload STL", "Choose Material", "We Print", "We Deliver"].map((step) => (
            <div key={step} className="border border-gray-200 bg-white p-5 rounded-xl text-center text-[#131921] font-medium shadow-sm">
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}