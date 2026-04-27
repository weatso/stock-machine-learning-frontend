"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { BellRing, X } from "lucide-react";

// Komponen ini berfungsi sebagai popup notifikasi realtime
// Dipanggil di dashboard/page.tsx untuk menampilkan alert harga target
export default function RealtimeAlertPopup() {
  const [alert, setAlert] = useState<{ ticker: string; price: number } | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const checkAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Placeholder: Di produksi, ini akan mendengarkan tabel notifikasi
      // atau menggunakan Supabase Realtime untuk mendeteksi alert baru.
    };

    // checkAlerts(); // Aktifkan jika backend sudah mengisi logika notifikasi
  }, []);

  if (!alert) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-[#111] border border-emerald-500/30 rounded-lg p-4 shadow-[0_0_30px_-15px_rgba(16,185,129,0.5)] flex items-start gap-4 animate-in slide-in-from-bottom-5 z-50">
      <div className="p-2 bg-emerald-500/10 rounded-full">
        <BellRing className="w-5 h-5 text-emerald-500 animate-pulse" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white tracking-wide">Target Harga Tercapai!</h4>
        <p className="text-xs text-gray-400 mt-1">
          Emiten <span className="text-emerald-400 font-bold">{alert.ticker}</span> telah menyentuh area beli di{" "}
          <span className="font-mono">Rp {alert.price.toLocaleString("id-ID")}</span>.
        </p>
      </div>
      <button
        onClick={() => setAlert(null)}
        className="text-gray-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}