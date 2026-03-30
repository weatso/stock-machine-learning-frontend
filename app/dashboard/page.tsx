import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Activity, ShieldCheck, AlertCircle, TrendingUp } from "lucide-react";

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // Kalkulasi Real-Time dari Database
  const [
    { count: totalEmiten },
    { count: totalGradeA },
    { count: totalAlerts }
  ] = await Promise.all([
    supabase.from('emitens').select('*', { count: 'exact', head: true }),
    supabase.from('ml_predictions').select('*', { count: 'exact', head: true }).eq('predicted_grade', 'A'),
    supabase.from('user_watchlists').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { label: "Total Emiten Dipindai", value: totalEmiten || 0, icon: Activity, color: "text-blue-500" },
    { label: "Sinyal Grade A (Buy)", value: totalGradeA || 0, icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Alert Pantauan Aktif", value: totalAlerts || 0, icon: AlertCircle, color: "text-amber-500" },
    { label: "Akurasi Model (RF)", value: "84.2%", icon: TrendingUp, color: "text-indigo-500" }, // Akurasi model adalah hasil statis dari training phase
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
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
        <div className="lg:col-span-2 p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Aktivitas Market Terkini</h2>
          <div className="text-sm text-gray-500 py-16 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/50">
            Akses menu ML Screener untuk melihat aliran data klasifikasi secara mendetail.
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Integritas Algoritma</h2>
          <div className="space-y-6">
            <p className="text-xs text-gray-400 leading-relaxed text-justify">
              Algoritma Random Forest beroperasi menggunakan Sequential Time-Series Split untuk mencegah kebocoran data (data leakage) dari pergerakan harga masa depan.
            </p>
            <div className="pt-4 border-t border-white/5 space-y-4">
               <div className="flex justify-between text-xs">
                 <span className="text-gray-500">Target Feature</span>
                 <span className="text-white font-mono">T+5 Price Action</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-gray-500">Class Imbalance Handling</span>
                 <span className="text-white font-mono">Synthetic Minority (SMOTE)</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}