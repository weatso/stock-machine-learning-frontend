"use client";

import { Activity, ShieldCheck, Database, Cpu, TrendingUp } from "lucide-react";
import RealtimeAlertPopup from "@/components/dashboard/RealtimeAlertProvider";

export default function DashboardOverview() {
  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* Panggil komponen penjaga Popup di sini agar selalu aktif di Dashboard */}
      <RealtimeAlertPopup />

      <header className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Command Center</h1>
        <p className="text-gray-400">Status operasional sistem mesin pembelajaran WEATSO Kuantitatif.</p>
      </header>

      {/* 3 KARTU METRIK UTAMA (Akurasi diganti Threshold) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Populasi Emiten</p>
            <h2 className="text-3xl font-mono font-black text-white">980<span className="text-sm font-sans text-gray-500 font-medium ml-2">Ticker</span></h2>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded uppercase tracking-wider">Aktif</span>
          </div>
          <div>
            {/* INI PENGGANTI AKURASI MODEL: Menjual "Keamanan", bukan "Tebakan" */}
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Precision Threshold</p>
            <h2 className="text-3xl font-mono font-black text-white">&ge; 65<span className="text-sm font-sans text-gray-500 font-medium ml-2">%</span></h2>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Inferensi Mesin</p>
            <h2 className="text-3xl font-mono font-black text-white">T+20<span className="text-sm font-sans text-gray-500 font-medium ml-2">Hari Bursa</span></h2>
          </div>
        </div>
      </div>

      {/* PENJELASAN INTEGRITAS ALGORITMA YANG DIREVISI */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="border-b border-white/10 p-6 bg-[#111]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Integritas Algoritma & Pipeline
          </h2>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            Sistem menerapkan Arsitektur Inferensi Klasifikasi berbasis <strong className="text-white">Random Forest Classifier</strong> dengan mekanisme <em className="text-indigo-300">Self-Correcting Data Pipeline</em>. Seluruh proses analisis dirancang untuk beroperasi tanpa intervensi emosional, memproses fusi data fundamental historis (8 kuartal) dan indikator teknikal secara asinkron.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-5 border border-white/5 rounded-xl bg-white/[0.02]">
              <h3 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wide">Mitigasi Data Leakage</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Integritas historis dipertahankan melalui teknik <code>Forward-Filling (ffill)</code> pada laporan keuangan kuartalan. Mesin dilarang keras mengakses data fundamental masa depan sebelum tanggal rilis resminya, memastikan simulasi *backtesting* terbebas dari kebocoran data (*Data Leakage*).
              </p>
            </div>
            <div className="p-5 border border-white/5 rounded-xl bg-white/[0.02]">
              <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Proteksi Modal (False Positive)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sistem tidak dirancang untuk menangkap semua peluang, melainkan meminimalisir kesalahan beli. Rekomendasi <strong>Grade A</strong> hanya dikeluarkan jika probabilitas keyakinan mesin menembus ambang presisi (*Precision Threshold*) ketat di atas <strong>65%</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}