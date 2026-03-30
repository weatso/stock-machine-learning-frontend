"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { BellRing, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeAlert, setActiveAlert] = useState<{ ticker: string, price: number } | null>(null);

  useEffect(() => {
    // 1. Koneksi ke Supabase
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 2. Simulator Deteksi Alert (Dalam skenario nyata, ini mendengarkan perubahan tabel atau API)
    // Untuk keperluan sidang MVP, kita buat mekanisme pengecekan berkala (Polling)
    const checkAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cari alert yang harga targetnya SAMA DENGAN ATAU LEBIH KECIL dari harga terakhir
      // (Asumsi target adalah 'Buy Limit'. Jika harga pasar turun menyentuh target, maka beli)
      
      // Catatan: Ini adalah query gabungan yang disederhanakan untuk UI
      // Di sistem riil, Backend Python Anda yang akan mengeksekusi ini dan mengisi tabel 'notifications'
      
      // Simulasi trigger: Munculkan alert BBCA jika ada di watchlist (hanya contoh visual)
      // setActiveAlert({ ticker: "BBCA", price: 8500 }); 
    };

    // checkAlerts(); // Aktifkan jika backend Anda sudah mengisi logika notifikasi
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050505] font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* SISTEM POP-UP NOTIFIKASI (Sesuai Proposal) */}
      {activeAlert && (
        <div className="fixed bottom-6 right-6 bg-[#111] border border-emerald-500/30 rounded-lg p-4 shadow-[0_0_30px_-15px_rgba(16,185,129,0.5)] flex items-start gap-4 animate-in slide-in-from-bottom-5 z-50">
          <div className="p-2 bg-emerald-500/10 rounded-full">
             <BellRing className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Target Harga Tercapai!</h4>
            <p className="text-xs text-gray-400 mt-1">
              Emiten <span className="text-emerald-400 font-bold">{activeAlert.ticker}</span> telah menyentuh area beli di <span className="font-mono">Rp {activeAlert.price.toLocaleString('id-ID')}</span>.
            </p>
          </div>
          <button 
            onClick={() => setActiveAlert(null)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}