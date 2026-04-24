"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, CloudUpload, FileBox } from "lucide-react"

export function HeroSection() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      router.push("/upload")
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (picked) {
      setFile(picked)
      router.push("/upload")
    }
  }

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
        {/* Headline */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Precision 3D Printing On Demand
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight mb-4">
            Upload Your Design.<br />
            <span className="text-primary">We Print & Deliver.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Turn your STL files into real-world products with precision 3D printing.
            Choose your material, set your specs, and we handle the rest.
          </p>
        </div>

        {/* Upload box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            mx-auto max-w-2xl cursor-pointer rounded-xl border-2 border-dashed
            transition-all duration-200 select-none
            ${dragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border bg-card hover:border-primary/60 hover:bg-primary/5"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".stl,.STL"
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center gap-4 py-16 px-8">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors ${dragging ? "border-primary bg-primary/20" : "border-border bg-secondary"}`}>
              <CloudUpload className={`h-8 w-8 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-1">
                {file ? file.name : "Drop your STL file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <span className="text-primary font-medium underline underline-offset-2">
                  click to browse
                </span>
                {" "}— .STL files only
              </p>
            </div>
            <div className="flex items-center gap-6 mt-2">
              {["Instant Pricing", "All Materials", "Fast Delivery"].map((tag) => (
                <div key={tag} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push("/upload")}
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Start Upload
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: "Materials", value: "5+" },
            { label: "Parts Printed", value: "50K+" },
            { label: "Delivery Time", value: "3–5 days" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
