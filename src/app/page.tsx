'use client';
import { Grenze, Antonio, Alice, Arimo, Inter } from 'next/font/google'
import { FaTelegramPlane, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { MdEmail } from "react-icons/md";


const grenze = Grenze({
  subsets: ['latin'],
  weight: ['400', '700']
})
const antonio = Antonio({
  subsets: ['latin'],
  weight: ['400', '700']
})
const arimo = Arimo({
  subsets: ['latin'],
  weight: ['400', '600', '700']
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function OrderCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const target = 127;
    const increment = Math.ceil(target / 50);
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(interval); }
      else { setCount(current); }
    }, 30);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="text-center py-8 px-6 rounded-3xl border border-purple-100 glow-purple"
      style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 50%, #F5F3FF 100%)' }}>
      <p className="text-lg font-semibold text-[#0F172A]">
        <span className="text-4xl font-bold gradient-text">{count}</span> prints delivered this month
      </p>
    </motion.div>
  );
}

function ScrollFadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }} viewport={{ once: true, margin: '-100px' }}>
      {children}
    </motion.div>
  );
}
function PricingCalculator() {
  const [material, setMaterial] = useState<'PLA' | 'PETG'>('PLA');
  const [weight, setWeight] = useState(50);

  const pricePerGram = material === 'PLA' ? 5 : 7;
  const baseCost = weight * pricePerGram;
  const gst = Math.round(baseCost * 0.18);
  const shipping = 60;
  const total = baseCost + gst + shipping;

  return (
    <div className="space-y-8">
      {/* Material Selector */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-[#0F172A] tracking-wide uppercase">Select Material</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMaterial('PLA')}
            className={`p-5 rounded-2xl border-2 font-bold transition-all duration-300 ${material === 'PLA'
              ? 'border-[#7C3AED] shadow-lg shadow-purple-100 scale-[1.02]'
              : 'border-slate-200 hover:border-purple-200 hover:shadow-md'
              }`}
            style={material === 'PLA' ? { background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)', color: '#0F172A' } : {}}
          >
            🌱 PLA Standard
            <div className="text-xs font-normal mt-1 text-[#64748B]">₹5/gram</div>
          </button>
          <button
            onClick={() => setMaterial('PETG')}
            className={`p-5 rounded-2xl border-2 font-bold transition-all duration-300 ${material === 'PETG'
              ? 'border-[#7C3AED] shadow-lg shadow-purple-100 scale-[1.02]'
              : 'border-slate-200 hover:border-purple-200 hover:shadow-md'
              }`}
            style={material === 'PETG' ? { background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)', color: '#0F172A' } : {}}
          >
            ⚙️ PETG Engineering
            <div className="text-xs font-normal mt-1 text-[#64748B]">₹7/gram</div>
          </button>
        </div>
      </div>

      {/* Weight Slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold" style={{ color: '#0F172A' }}>
            Estimated Weight
          </label>
          <span className="text-2xl font-bold" style={{ color: '#7C3AED' }}>
            {weight}g
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${(weight / 500) * 100}%, #e5e7eb ${(weight / 500) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10g</span>
          <span>500g</span>
        </div>
      </div>
      {/* Price Breakdown */}
      <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-2xl p-5 space-y-3 border border-slate-100">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Print Cost ({material})</span>
          <span className="font-semibold text-[#0F172A]">₹{baseCost}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">GST (18%)</span>
          <span className="font-semibold text-[#0F172A]">₹{gst}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Shipping</span>
          <span className="font-semibold text-[#0F172A]">₹{shipping}</span>
        </div>
        <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center">
          <span className="font-bold text-lg text-[#0F172A]">Estimated Total</span>
          <span className="font-bold text-2xl gradient-text">₹{total}</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/upload"
        className="block w-full text-center py-4 font-bold rounded-2xl text-white text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
      >
        Get Exact Quote →
      </Link>
      <p className="text-center text-xs text-[#94A3B8]">
        * Final price based on actual file analysis
      </p>
    </div>
  );
}

function TestimonialCarousel() {
  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Mechanical Engineering Student, IIT Delhi',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      text: 'Powerlay saved my final year project! The gear mechanism printed perfectly and the quality was outstanding. Delivered in just 2 days.',
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'Product Designer, Startup Founder',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      text: 'I needed prototypes for investor meetings. Powerlay delivered high-quality prints at an affordable price. The team was super responsive!',
      rating: 5,
    },
    {
      name: 'Arjun Verma',
      role: 'Robotics Hobbyist',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      text: 'Printed custom robot parts and miniatures. The detail is incredible! Will definitely use Powerlay for all my future projects.',
      rating: 5,
    },
    {
      name: 'Sneha Reddy',
      role: 'Architecture Student, NIT Trichy',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      text: 'My architectural model came out beautifully. The pricing was transparent and the quote arrived within 12 hours. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Vikram Singh',
      role: 'Electronics Engineer',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
      text: 'Needed custom enclosures for circuit boards. Powerlay understood my requirements perfectly. Great communication throughout!',
      rating: 5,
    },
  ];

  return (
    <div className="relative">
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
        {testimonials.map((testimonial, idx) => (
          <ScrollFadeIn key={idx} delay={idx * 0.1}>
            <div className="flex-shrink-0 w-80 sm:w-96 snap-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 h-full border border-slate-200/80">
                {/* Quote mark */}
                <div className="gradient-text text-4xl font-serif mb-3">“</div>

                {/* Text */}
                <p className="text-[#1E293B] text-base mb-6 leading-relaxed">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
                  />
                  <div>
                    <div className="font-bold text-[#0F172A] text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {testimonial.role}
                    </div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-400">← Scroll to see more →</p>
      </div>
    </div>
  );
}

function CategoryTabs() {
  const [activeTab, setActiveTab] = useState<'students' | 'engineers' | 'hobbyists' | 'startups'>('students');

  const categories = {
    students: [
      { title: 'College Projects', desc: 'Engineering models, prototypes for final year projects', img: 'Drone 3D printed.jpg', color: '#7C3AED' },
      { title: 'Lab Equipment', desc: 'Custom fixtures, mounts, experimental setups', img: 'LAB EQUIPMENT.png', color: '#60a5fa' },
      { title: 'Study Models', desc: 'Anatomical models, molecular structures, architectural replicas', img: 'Study Models.png', color: '#f472b6' },
    ],
    engineers: [
      { title: 'Functional Prototypes', desc: 'Gears, brackets, mounts, mechanical assemblies', img: 'Functional Prototypes.png', color: '#7C3AED' },
      { title: 'Testing Jigs', desc: 'Custom fixtures, test rigs, measurement tools', img: 'Testing Jigs.png', color: '#34d399' },
      { title: 'Enclosures', desc: 'Electronics housings, protective cases, custom boxes', img: 'Enclosures.png', color: '#a78bfa' },
    ],
    hobbyists: [
      { title: 'Gaming & Collectibles', desc: 'Miniatures, figures, props, cosplay accessories', img: 'Gaming & Collectibles.jpg', color: '#f472b6' },
      { title: 'Art & Decor', desc: 'Sculptures, wall art, decorative pieces, planters', img: 'Art and decor.jpg', color: '#fb923c' },
      { title: 'Custom Accessories', desc: 'Phone stands, cable organizers, desk organizers', img: 'Custom Accessories.jpg', color: '#34d399' },
    ],
    startups: [
      { title: 'Product Prototypes', desc: 'MVP models, investor presentations, design iterations', img: 'Product Prototypes.png', color: '#7C3AED' },
      { title: 'Market Testing', desc: 'Low-volume production, market validation samples', img: 'Market Testing.png', color: '#60a5fa' },
      { title: 'Trade Show Models', desc: 'Display pieces, demo units, booth materials', img: 'Gemini_Generated_Image_i18j12i18j12i18j.png', color: '#a78bfa' },
    ],
  };

  const tabs = [
    { id: 'students', label: '🎓 Students', desc: 'College & School Projects' },
    { id: 'engineers', label: '⚙️ Engineers', desc: 'Professional Prototypes' },
    { id: 'hobbyists', label: '🎨 Hobbyists', desc: 'Creative Projects' },
    { id: 'startups', label: '🚀 Startups', desc: 'Product Development' },
  ] as const;

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.id
              ? 'shadow-lg shadow-purple-200 scale-105 text-white'
              : 'bg-white/80 backdrop-blur border border-slate-200 hover:border-purple-200 hover:shadow-md text-[#0F172A]'
              }`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #7C3AED, #2563EB)' } : {}}
          >
            <div className="text-lg">{tab.label}</div>
            <div className="text-xs font-normal opacity-80">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories[activeTab].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer"
          >
            <img
              src={item.img}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-2"
              style={{ background: item.color }} />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="text-white font-bold text-xl mb-1">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.desc}
              </p>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-black"
              style={{ background: item.color }}>
              3D Print
            </div>
          </motion.div>
        ))}
      </div>

      <ScrollFadeIn>
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-6">Don't see your category? We print almost anything!</p>
          <Link href="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-2xl text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
            Upload Your Design →
          </Link>
        </div>
      </ScrollFadeIn>
    </div>
  );
}
export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = [
    {
      question: "What file formats do you accept?",
      answer:
        "We accept STL files. If you have a different format (OBJ, STEP, etc.), please contact us and we'll help convert it.",
    },
    {
      question: "How long does printing take?",
      answer:
        "Most orders are completed in 2-3 days after payment. Complex or large prints may take 4-5 days. You'll receive a specific timeline with your quote.",
    },
    {
      question: "What materials do you offer?",
      answer:
        "We currently offer PLA (biodegradable, great for prototypes) and PETG (stronger, heat-resistant, ideal for functional parts). Each material has different pricing.",
    },
    {
      question: "How is pricing calculated?",
      answer:
        "Pricing is based on material weight, material type (PLA at ₹5/gram, PETG at ₹7/gram), plus 18% GST and ₹60 flat shipping across India.",
    },
    {
      question: "Do you offer bulk discounts?",
      answer:
        "Yes! For orders over 10 identical parts, contact us for custom bulk pricing. We're happy to work with students and startups.",
    },
    {
      question: "What if my print fails or has defects?",
      answer:
        "Every print is quality-checked before shipping. If there's any defect, we'll reprint it for free. Your satisfaction is guaranteed.",
    },
    {
      question: "Can you help me design my 3D model?",
      answer:
        "We're a printing service, not a design agency. However, we can recommend freelance designers or point you to learning resources.",
    },
    {
      question: "Do you ship outside India?",
      answer:
        "Currently we only ship within India. International shipping is coming soon!",
    },
  ];
  return (
    <div className={`w-full ${inter.className}`}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Logo.png" alt="Powerlay" className="h-8 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#how-it-works" className="text-[#64748B] hover:text-[#7C3AED] transition-colors duration-200">How It Works</a>
              <a href="#materials" className="text-[#64748B] hover:text-[#7C3AED] transition-colors duration-200">Materials</a>
              <Link href="/dashboard" className="text-[#64748B] hover:text-[#7C3AED] transition-colors duration-200">Dashboard</Link>
              <Link href="/orders" className="text-[#64748B] hover:text-[#7C3AED] transition-colors duration-200">Orders</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-[#64748B] hover:text-[#7C3AED] transition-colors duration-200 hidden sm:block">
                Sign In
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl text-sm text-white shadow-md shadow-purple-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                ⬆️ Upload STL
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero with Video */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/7035591-uhd_3840_2160_24fps.mp4"
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/85 via-white/75 to-purple-50/70" />

        {/* Animated gradient blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full filter blur-3xl animate-blob z-10" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 z-10" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-300/20 rounded-full filter blur-3xl animate-blob animation-delay-4000 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                <span className="text-sm font-medium text-[#7C3AED]">Layer by Layer Precision</span>
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-[#0F172A] tracking-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Turn Your Ideas Into{" "}
                <span className="gradient-text">Reality</span>
              </motion.h1>

              <motion.p
                className={`text-lg text-[#475569] leading-relaxed mb-8 max-w-xl ${arimo.className}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Upload your STL file. We quote within 24 hours.
                You pay, we print, we deliver.
                Your ideas — physically real, at your doorstep.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-1 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                >
                  ⬆️ Upload Your File
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl border-2 border-slate-200 text-[#0F172A] hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-purple-50/50 transition-all duration-300"
                >
                  Learn More →
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="flex items-center gap-6 mt-8 text-sm text-[#64748B]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-center gap-1.5"><span className="text-base">⚙️</span> 0.1mm Accuracy</div>
                <div className="flex items-center gap-1.5"><span className="text-base">🚚</span> 2-3 Day Delivery</div>
                <div className="flex items-center gap-1.5"><span className="text-base">⭐</span> 4.9/5 Rating</div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
              <div className="rounded-3xl p-8 space-y-6 glass-card card-shadow">
                <h3 className="text-[#0F172A] font-bold text-xl">Why Powerlay?</h3>
                <div className="space-y-4">
                  {[
                    { icon: '⚡', label: 'Fast Turnaround', value: '2-3 Days' },
                    { icon: '🎯', label: 'Print Accuracy', value: '0.1mm' },
                    { icon: '📦', label: 'Prints Delivered', value: '500+' },
                    { icon: '⭐', label: 'Customer Rating', value: '4.9/5' },
                    { icon: '💳', label: 'Payment', value: 'Razorpay' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className="text-[#64748B] text-sm">{stat.label}</span>
                      </div>
                      <span className="font-bold gradient-text">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/upload" className="block w-full text-center py-3 font-bold rounded-xl text-sm text-white shadow-md shadow-purple-200 hover:shadow-lg transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                  Start Your Order →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logo Marquee Strip */}
      <section className="py-8 overflow-hidden border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "IIT Delhi", "NIT Trichy", "VIT Vellore", "BITS Pilani", "Delhi University",
            "IIIT Hyderabad", "Anna University", "Manipal Institute", "SRM University",
            "IIT Delhi", "NIT Trichy", "VIT Vellore", "BITS Pilani", "Delhi University"
          ].map((college, idx) => (
            <div key={idx} className="inline-flex items-center mx-8">
              <span className="text-[#64748B] font-semibold text-lg">{college}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/30 via-transparent to-blue-50/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[['Razerpay', 'Secure payement', '💳'], [' 1-2 Days', 'Day Turnaround', '⚡'], ['PLA, PETG', 'Premium Materials', '🧪'], ['100%', 'Quality Checked', '✅']].map(([num, label, icon], i) => (
              <ScrollFadeIn key={label} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
                  className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur border border-slate-200/60 card-shadow hover:card-shadow-hover transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)' }}>{icon}</div>
                  <div className="text-2xl font-bold mb-1 gradient-text">{num}</div>
                  <p className="text-[#64748B] text-sm">{label}</p>
                </motion.div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollFadeIn>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
              <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Pricing</span>
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A]">Quick Price Estimate</h2>
          </div>
        </ScrollFadeIn>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto rounded-3xl p-8 glass-card card-shadow"
        >
          <PricingCalculator />
        </motion.div>
      </div>

      {/* Gallery */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/20 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Portfolio</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A]">Gallery of Our Prints</h2>
            </div>
          </ScrollFadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { src: 'inductin motor.jpg', alt: '3D printer motor', tag: 'Motor' },
              { src: 'skull print .jpg', alt: '3D printing prototpe', tag: 'Prototype' },
              { src: 'pikachu print.jpg', alt: '3D printed pikachu', tag: 'Character' },
              { src: 'lizard print.jpg', alt: '3D printed lizard', tag: 'Figurine' },
              { src: 'Blue figure.jpg', alt: '3D printed prototype', tag: 'Prototype' },
              { src: 'Bowl Print.jpg', alt: '3D printed prototype', tag: 'Decor' },
              { src: 'glass print.jpg', alt: '3D printed parts', tag: 'Parts' },
              { src: 'Machines.jpg', alt: '3D printing Machines', tag: 'Machines' },
            ].map((item, idx) => (
              <ScrollFadeIn key={idx} delay={idx * 0.05}>
                <div className="rounded-3xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 aspect-square group relative">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.tag}
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="bg-slate-50 py-16 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/20 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollFadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🖨️", title: "2+", description: "Printers Running", color: "#7C3AED" },
                { icon: "✅", title: "10+", description: "Projects Completed", color: "#2563EB" },
                { icon: "🚚", title: "2-3 Day", description: "Delivery", color: "#059669" },
                { icon: "🧪", title: "PLA & PETG", description: "Materials", color: "#a78bfa" },
              ].map((stat, index) => (
                <ScrollFadeIn key={stat.description} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="h-full rounded-3xl bg-white/90 backdrop-blur border border-slate-200/60 p-6 text-center card-shadow hover:card-shadow-hover transition-all duration-300"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: `${stat.color}15` }}>
                      {stat.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-1 text-[#0F172A]">{stat.title}</h3>
                    <p className="text-sm text-[#64748B]">{stat.description}</p>
                  </motion.div>
                </ScrollFadeIn>
              ))}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* What Can You Print - Tabbed */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Categories</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-3">What Can You Print?</h2>
              <p className="text-[#64748B] text-lg">From prototypes to decorative items, we print almost anything</p>
            </div>
          </ScrollFadeIn>

          <CategoryTabs />
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-slate-50 py-20 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-100/20 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Testimonials</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-3">What Our Customers Say</h2>
              <p className="text-[#64748B] text-lg">Real feedback from engineers, students, and makers</p>
            </div>
          </ScrollFadeIn>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Featured Videos */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Videos</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-3">See Our Prints Come to Life</h2>
              <p className="text-[#64748B] text-lg">Watch timelapse videos of 3D printing from our workshop</p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "PLA Agitator", videoId: "dQw4w9WgXcQ" },
              { title: "PETG Agitator Tank", videoId: "ysz5S6PUM-U" },
              { title: "Miniature Print", videoId: "ScMzIvxBSi4" },
              { title: "Engineering Part", videoId: "aqz-KE-bpKQ" },
              { title: "Architecture Model", videoId: "jNQXAC9IVRw" },
              { title: "Phone Stand", videoId: "M7lc1UVf-VE" },
            ].map((video, index) => (
              <ScrollFadeIn key={video.title} delay={index * 0.08}>
                <motion.a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="group block overflow-hidden rounded-3xl bg-white/90 backdrop-blur border border-slate-200/60 card-shadow hover:card-shadow-hover transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
                      >
                        <span className="ml-1 text-2xl" style={{ color: "#FFFFFF" }}>
                          ▶
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold" style={{ color: "#0F172A" }}>
                      {video.title}
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Watch the complete 3D printing process.
                    </p>
                  </div>
                </motion.a>
              </ScrollFadeIn>
            ))}
          </div>

          <div className="mt-14 text-center">
            <motion.a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
            >
              Watch More on YouTube →
            </motion.a>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="how-it-works" className="bg-slate-50 py-20 relative overflow-hidden">
        <div className="absolute top-20 left-0 w-80 h-80 bg-blue-100/20 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollFadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Process</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-3">How It Works</h2>
              <p className="text-[#64748B] text-lg">Four simple steps from design to delivery</p>
            </div>
          </ScrollFadeIn>

          <div className="space-y-12">
            {[
              {
                stage: 1,
                title: 'Upload Your STL File',
                desc: 'Simply drag and drop your 3D model file. We support STL format with detailed preview and file analysis.',
                details: ['Instant file validation', 'Automatic size calculation', 'Material recommendations'],
                img: 'Upload your Stl.png',
                color: '#7C3AED',
              },
              {
                stage: 2,
                title: 'Get Your Quote in 24 Hours',
                desc: 'Our team analyzes your file and provides a detailed quote based on material, complexity, and specifications.',
                details: ['Transparent pricing breakdown', 'Multiple material options', 'Custom specifications support'],
                img: 'Get quote in 24 hrs.png',
                color: '#60a5fa',
              },
              {
                stage: 3,
                title: 'Secure Payment via Razorpay',
                desc: 'Pay safely through Razorpay with multiple payment options including UPI, cards, netbanking, and wallets.',
                details: ['256-bit encryption', 'Multiple payment methods', 'Instant payment confirmation'],
                img: 'Secure Payment via Razorpay.png',
                color: '#34d399',
              },
              {
                stage: 4,
                title: 'Receive Your Print at your doorstep',
                desc: 'We print, quality check, and ship your order. Track your delivery anywhere in India with real-time updates.',
                details: ['100% quality checked', 'Secure packaging', 'Pan-India delivery'],
                img: 'Recieve your Print at your Doorstep.png',
                color: '#a78bfa',
              },
            ].map((step, idx) => (
              <ScrollFadeIn key={step.stage} delay={idx * 0.1}>
                <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}>
                  {/* Image */}
                  <div className="lg:w-1/2">
                    <div className="relative rounded-3xl overflow-hidden card-shadow h-80 group">
                      <img
                        src={step.img}
                        alt={step.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-6 left-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}>
                        {step.stage}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 space-y-4">
                    <div className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                      style={{ background: `${step.color}20`, color: step.color }}>
                      STAGE {step.stage}
                    </div>
                    <h3 className="text-3xl font-bold" style={{ color: '#0F172A' }}>
                      {step.title}
                    </h3>
                    <p className="text-[#64748B] text-lg leading-relaxed">
                      {step.desc}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ background: step.color }}>✓</span>
                          <span className="text-[#1E293B]">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          {/* FAQ Section */}
          <section className="bg-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollFadeIn>
                <div className="text-center mb-14">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                    <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">FAQ</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-3 text-[#0F172A]">Frequently Asked Questions</h2>
                  <p className="text-[#64748B] text-lg">Everything you need to know about our 3D printing service</p>
                </div>
              </ScrollFadeIn>

              <div className="rounded-3xl bg-white border border-slate-200/60 card-shadow overflow-hidden">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <div key={faq.question} className="border-b border-slate-100 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors duration-200"
                      >
                        <span className="text-lg font-semibold" style={{ color: "#0F172A" }}>
                          {faq.question}
                        </span>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-2xl font-bold shrink-0"
                          style={{ color: "#7C3AED" }}
                        >
                          {isOpen ? "−" : "+"}
                        </motion.span>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? "auto" : 0,
                          opacity: isOpen ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-[#1E293B]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <ScrollFadeIn>
            <div className="text-center mt-16">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-10 py-5 text-xl font-bold rounded-2xl text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                Start Your Order Now →
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Materials */}
      < section id="materials" className="bg-white py-20" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Materials</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A]">Choose Your Material</h2>
            </div>
          </ScrollFadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScrollFadeIn>
              <Card className="border border-slate-200/60 overflow-hidden h-full rounded-3xl card-shadow hover:card-shadow-hover transition-all duration-300">
                <div className="text-white p-8" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
                  <h3 className="text-3xl font-bold mb-2">🌱 PLA Standard</h3>
                  <div className="text-4xl font-bold mb-1">From ₹5<span className="text-lg">/gram</span></div>
                  <p className="text-purple-200">Perfect for prototypes & decorative items</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {['High detail and smooth finish', 'Wide color selection available', 'Eco-friendly biodegradable material', 'Ideal for home & office decor', 'Cost-effective option'].map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-lg">✅</span>
                        <span className="text-[#1E293B] text-lg">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/upload" className="block w-full text-center py-4 text-lg font-bold rounded-xl border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF] transition-colors">
                    Order PLA Print
                  </Link>
                </div>
              </Card>
            </ScrollFadeIn>
            <ScrollFadeIn delay={0.1}>
              <Card className="border border-slate-200/60 overflow-hidden h-full rounded-3xl card-shadow hover:card-shadow-hover transition-all duration-300" style={{ borderColor: '#7C3AED' }}>
                <div className="p-8 relative" style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
                  <div className="absolute top-4 right-4 text-[#7C3AED] bg-white px-3 py-1 rounded-full text-sm font-bold">POPULAR</div>
                  <h3 className="text-3xl font-bold mb-2 text-white">⚙️ PETG Engineering Grade</h3>
                  <div className="text-4xl font-bold mb-1 text-white">From ₹7<span className="text-lg">/gram</span></div>
                  <p className="text-purple-200">Professional-grade engineering parts</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {['Superior strength & durability', 'Temperature & impact resistant', 'Perfect for functional parts', 'Used in professional applications', 'Longer lifespan than PLA'].map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-lg">✅</span>
                        <span className="text-[#1E293B] text-lg">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/upload" className="block w-full text-center py-4 text-lg font-bold rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors">
                    Order PETG Print
                  </Link>
                </div>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section >

      {/* Why Choose Us */}
      < section className="bg-slate-50 py-20 relative overflow-hidden" >
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-100/15 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Why Us</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F172A]">Why Choose Powerlay?</h2>
            </div>
          </ScrollFadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { emoji: '⚡', title: 'Fast Delivery', description: 'Get your 3D prints in just 2-3 business days. We prioritize speed without compromising quality.' },
              { emoji: '🛡️', title: 'Quality Guaranteed', description: 'Every print is 100% quality checked before shipping. We stand behind our work.' },
              { emoji: '💳', title: 'Secure Payment', description: 'Pay securely through Razorpay. Multiple options including cards, UPI, and wallets.' },
            ].map((item, idx) => (
              <ScrollFadeIn key={idx} delay={idx * 0.1}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                  <Card className="border border-slate-200/60 bg-white/90 backdrop-blur rounded-3xl card-shadow hover:card-shadow-hover transition-all duration-300 p-8 text-center h-full">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)' }}>{item.emoji}</div>
                    <h3 className="text-xl font-bold mb-3 text-[#0F172A]">{item.title}</h3>
                    <p className="text-[#64748B] text-base leading-relaxed">{item.description}</p>
                  </Card>
                </motion.div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section >

      {/* CTA */}
      < section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 30%, #E0E7FF 70%, #F3E8FF 100%)' }}>
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300/15 rounded-full filter blur-3xl" />
        <ScrollFadeIn>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-[#0F172A]">Ready to Print Your Design?</h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto text-[#475569]">
              Upload your STL file now and see your ideas come to life. Get a quote within 24 hours.
            </p>
            <Link href="/upload" className="inline-flex items-center gap-2 px-12 py-5 text-xl font-bold rounded-2xl text-white shadow-lg shadow-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
              ⬆️ Upload Now
            </Link>
          </div>
        </ScrollFadeIn>
      </section >

      {/* WhatsApp */}
      < motion.a href="https://wa.me/918462831438" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 p-4 rounded-full shadow-lg"
        style={{ background: '#25D366' }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a >

      {/* Footer */}
      < footer className="text-white py-20 footer-glow relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/5 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">📦</span>
                <span className="text-2xl font-bold text-white">Powerlay</span>
              </div>
              <p className="text-[#CBD5E1] text-base leading-relaxed mb-4">
                Premium 3D printing service bringing your ideas to life with precision and speed across India.
              </p>
              <p className="font-semibold" style={{ color: '#A78BFA' }}>Made with 💚 in India</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4" style={{ color: '#A78BFA' }}>Quick Links</h4>
              <ul className="space-y-2">
                {[['Home', '/'], ['Dashboard', '/dashboard'], ['Upload', '/upload'], ['Orders', '/orders']].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[#CBD5E1] hover:text-[#A78BFA] transition-colors text-base">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4" style={{ color: '#A78BFA' }}>Support</h4>
              <ul className="space-y-2">
                {['Contact Us', 'FAQ', 'How It Works', 'Pricing'].map((link) => (
                  <li key={link}><Link href="#" className="text-[#CBD5E1] hover:text-[#A78BFA] transition-colors text-base">{link}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4" style={{ color: '#A78BFA' }}>Get in Touch</h4>
              <ul className="space-y-3 text-[#CBD5E1] text-base">

                <li>
                  <a
                    href="mailto:Powerlayofficial@gmail.com"
                    className="flex items-center gap-2 hover:text-[#A78BFA] transition"
                  >
                    <MdEmail className="text-[#A78BFA] text-lg" />
                    Powerlayofficial@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/powerlay2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#A78BFA] transition"
                  >
                    <FaInstagram className="text-pink-400 text-lg" />
                    Instagram: @powerlay2025
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/Power_Lay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#A78BFA] transition"
                  >
                    <FaTelegramPlane className="text-blue-400 text-lg" />
                    Telegram: @Power_Lay
                  </a>
                </li>

                <li>
                  <a
                    href="https://wa.me/918462831438"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#A78BFA] transition"
                  >
                    <FaWhatsapp className="text-green-400 text-lg" />
                    WhatsApp: +91 8462831438
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  ⏰ Available 24/7
                </li>

              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>© 2024 Powerlay. All rights reserved.</p>
          </div>
        </div>
      </footer >

    </div >
  );
}
