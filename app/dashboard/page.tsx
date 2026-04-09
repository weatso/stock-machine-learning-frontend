import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Activity, ShieldCheck, AlertCircle, Cpu, Flame, ShieldAlert } from "lucide-react";
import RealtimeAlertPopup from "@/components/dashboard/RealtimeAlertProvider"; // Tambahan

export const revalidate = 0; 
export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // Tarik Data Paralel
  const [
    { count: totalEmiten },
    { count: totalGradeA },
    { count: totalAlerts },
    { data: screenerData }
  ] = await Promise.all([
    supabase.from('emitens').select('*', { count: 'exact', head: true }),
    supabase.from('ml_predictions').select('*', { count: 'exact', head: true }).eq('predicted_grade', 'A'),
    supabase.from('user_watchlists').select('*', { count: 'exact', head: true }),
    supabase.from('screener_view').select('*')
  ]);

  // Filter Aktivitas Market (Hancurkan Anomali Matematika)
  let topMos = [];
  let bottomMos = [];
  let bestBuy = null;
  let bestSell = null;

  if (screenerData && screenerData.length > 0) {
    const validMos = screenerData.filter(s => 
      s.margin_of_safety !== null && 
      s.margin_of_safety !== undefined &&
      s.margin_of_safety >= -100 && // Filter Overvalue yang hancur (kurang dari -100%)
      s.margin_of_safety <= 500     // Filter Undervalue yang tidak realistis (lebih dari 500%)
    );
    
    const sortedDesc = [...validMos].sort((a, b) => b.margin_of_safety - a.margin_of_safety);
    const sortedAsc = [...validMos].sort((a, b) => a.margin_of_safety - b.margin_of_safety);
    
    topMos = sortedDesc.slice(0, 3);
    bottomMos = sortedAsc.slice(0, 3);

    bestBuy = validMos.filter(s => s.ai_grade === 'A').sort((a, b) => b.margin_of_safety - a.margin_of_safety)[0];
    bestSell = validMos.filter(s => s.ai_grade === 'C').sort((a, b) => a.margin_of_safety - b.margin_of_safety)[0];
  }

  // REVISI METRIK: Hapus Akurasi, Ganti dengan Threshold & Prediksi Horizon
  const stats = [
    { label: "Total Emiten Dipindai", value: totalEmiten || 0, icon: Activity, color: "text-blue-500" },
    { label: "Sinyal Grade A (Buy)", value: totalGradeA || 0, icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Alert Pantauan Aktif", value: totalAlerts || 0, icon: AlertCircle, color: "text-amber-500" },
    { label: "Precision Threshold", value: "≥ 65%", icon: Cpu, color: "text-indigo-500" }, 
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Panggil komponen penjaga Popup di sini agar selalu aktif di Dashboard */}
      <RealtimeAlertPopup />

      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Market Overview</h1>
        <p className="text-sm text-gray-500">Ringkasan analitik harian berdasarkan fusi data fundamental dan teknikal.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center gap-4 transition-all hover:border-white/10">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
              <p className="text-2xl font-mono text-white leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl flex flex-col">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Aktivitas Market Terkini</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Flame className="w-3 h-3 text-emerald-500"/> Top Margin of Safety (Undervalued)</h3>
                <div className="space-y-2">
                  {topMos.map(s => (
                    <div key={s.ticker} className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                      <span className="font-bold text-white text-sm">{s.ticker}</span>
                      <span className="font-mono text-xs text-emerald-400">+{s.margin_of_safety.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-rose-500"/> Bottom Margin of Safety (Overvalued)</h3>
                <div className="space-y-2">
                  {bottomMos.map(s => (
                    <div key={s.ticker} className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-white/5">
                      <span className="font-bold text-white text-sm">{s.ticker}</span>
                      <span className="font-mono text-xs text-rose-400">{s.margin_of_safety.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Sinyal Prioritas Algoritma</h3>
              
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10"><ShieldCheck className="w-24 h-24 text-emerald-500"/></div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Top Buy (Grade A)</p>
                {bestBuy ? (
                  <>
                    <p className="text-3xl font-black text-white">{bestBuy.ticker}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">Harga:</span> <span className="text-emerald-400 font-mono">{bestBuy.latest_price?.toLocaleString('id-ID')}</span></div>
                      <div><span className="text-gray-500">MoS:</span> <span className="text-emerald-400 font-mono">+{bestBuy.margin_of_safety?.toFixed(2)}%</span></div>
                      <div><span className="text-gray-500">PER:</span> <span className="text-emerald-400 font-mono">{bestBuy.per?.toFixed(2)}</span></div>
                      <div><span className="text-gray-500">ROE:</span> <span className="text-emerald-400 font-mono">{bestBuy.roe?.toFixed(1)}%</span></div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Menunggu sinyal Grade A.</p>
                )}
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl relative overflow-hidden mt-4">
                <div className="absolute -right-4 -top-4 opacity-10"><AlertCircle className="w-24 h-24 text-rose-500"/></div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Top Sell (Grade C)</p>
                {bestSell ? (
                  <>
                    <p className="text-3xl font-black text-white">{bestSell.ticker}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">Harga:</span> <span className="text-rose-400 font-mono">{bestSell.latest_price?.toLocaleString('id-ID')}</span></div>
                      <div><span className="text-gray-500">MoS:</span> <span className="text-rose-400 font-mono">{bestSell.margin_of_safety?.toFixed(2)}%</span></div>
                      <div><span className="text-gray-500">PBV:</span> <span className="text-rose-400 font-mono">{bestSell.pbv?.toFixed(2)}</span></div>
                      <div><span className="text-gray-500">ROA:</span> <span className="text-rose-400 font-mono">{bestSell.roa?.toFixed(1)}%</span></div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Tidak ada sinyal bahaya.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REVISI INTEGRITAS ALGORITMA */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Integritas Algoritma</h2>
          <div className="space-y-6">
            <p className="text-xs text-gray-400 leading-relaxed text-justify">
              Algoritma beroperasi dengan <strong className="text-white font-medium">Random Forest Classifier</strong> menggunakan <em>Sequential Time-Series Split</em>. Mekanisme <em>Forward-Filling</em> diterapkan ketat pada laporan keuangan untuk mencegah <em>Data Leakage</em> masa depan.
            </p>
            <div className="pt-4 border-t border-white/5 space-y-4">
               <div className="flex justify-between text-xs">
                 <span className="text-gray-500">Horizon Inferensi</span>
                 <span className="text-white font-mono bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">T+20 (1 Bulan)</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-gray-500">Risk Management</span>
                 <span className="text-white font-mono">Precision Threshold ≥ 65%</span>
               </div>
               <div className="flex justify-between text-xs items-center mt-2">
                 <span className="text-gray-500">Fusi Data Input</span>
                 <div className="flex flex-col items-end">
                    <span className="text-white font-mono text-right text-[10px] text-gray-400">Teknikal (RSI, MACD, MFI)</span>
                    <span className="text-white font-mono text-right text-[10px] text-gray-400 mt-1">Fundamental (PER, PBV, ROA, ROE)</span>
                    <span className="text-white font-mono text-right text-[10px] text-gray-400 mt-1">Valuasi Intrinsic (MoS)</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}