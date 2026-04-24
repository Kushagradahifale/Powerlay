"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SaaSNavbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  return (
    <header className="bg-[#131921] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold text-white tracking-wide">
          POWERLAY
        </Link>
        <nav className="flex items-center gap-6">
          <div className="text-sm">
            <p className="text-gray-400 text-xs">Account</p>
            {userEmail ? (
              <Link href="/dashboard" className="font-semibold hover:text-[#febd69] truncate max-w-[160px] block">
                {userEmail}
              </Link>
            ) : (
              <Link href="/login" className="font-semibold hover:text-[#febd69]">
                Sign In
              </Link>
            )}
          </div>
          <Link href="/orders" className="text-sm hover:text-[#febd69]">
            <p className="text-gray-400 text-xs">Returns &</p>
            <p className="font-semibold">Orders</p>
          </Link>
          <Link
            href="/upload"
            className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold px-5 py-2 rounded-lg text-sm"
          >
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
