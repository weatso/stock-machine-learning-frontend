import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, Cpu, Activity, BarChart3 } from "lucide-react";
import StockChart from "@/components/StockChart";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function GradeBadge({ grade }: { grade: string }) {
  if (grade === "A") return <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"><ShieldCheck className="w-4 h-4" /> STRONG BUY (A)</span>;
  if (grade === "C") return <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold"><AlertTriangle className="w-4 h-4" /> STRONG SELL (C)</span>;
  return <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-bold">NEUTRAL (B)</span>;
}

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // Tarik Data Paralel dari Supabase (Tanpa API Lokal 127.0.0.1 agar aman di-deploy)
  const [
    { data: identity },
    { data: fundamental },
    { data: ai_analysis }
  ] = await Promise.all([
    supabase.from('emitens').select('*').eq('ticker', ticker).single(),
    supabase.from('financial_reports').select('*').eq('ticker', ticker).order('period_date', { ascending: false }).limit(1).single(),
    supabase.from('ml_predictions').select('*').eq('ticker', ticker).order('prediction_date', { ascending: false }).limit(1).single()
  ]);

  // Jika emiten tidak ditemukan, lempar ke 404
  if (!identity) return notFound();

  // Mencegah error jika data ML belum siap
  const features = ai_analysis?.feature_importance || {};
  const grade = ai_analysis?.predicted_grade || "B";

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-8 flex flex-col gap-6">
      {/* 1. HEADER NAVIGASI (RESTORED ORISINAL) */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/stocks" className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 w-fit transition-colors">
            <ArrowLeft className="w-3 h-3" /> Kembali ke Screener
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden p-2">
              {identity.logo_url ? (
                <Image src={identity.logo_url} alt={ticker} width={48} height={48} className="object-contain" />
              ) : (
                <span className="text-black font-bold">{ticker.substring(0,2)}</span>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{ticker}</h1>
              <p className="text-sm text-gray-400">{identity.company_name} &bull; {identity.sector}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Machine Learning Output</p>
          <GradeBadge grade={grade} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: TEKNIKAL & FUNDAMENTAL */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* GRID FUNDAMENTAL BARU */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Pilar Fundamental (Kuartal Terakhir)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">PER</p>
                <p className="text-xl font-mono text-white">{fundamental?.per != null ? fundamental.per.toFixed(2) : "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">PBV</p>
                <p className="text-xl font-mono text-white">{fundamental?.pbv != null ? fundamental.pbv.toFixed(2) : "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">ROA</p>
                <p className="text-xl font-mono text-emerald-400">{fundamental?.roa != null ? `${fundamental.roa.toFixed(1)}%` : "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">ROE</p>
                <p className="text-xl font-mono text-emerald-400">{fundamental?.roe != null ? `${fundamental.roe.toFixed(1)}%` : "-"}</p>
              </div>
            </div>
          </section>

          {/* STOCK CHART */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Pilar Teknikal & Volume (T-100 Days)
            </h2>
            <div className="h-[400px] w-full border border-white/5 bg-black/50 rounded-lg overflow-hidden">
              <StockChart ticker={ticker} />
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: AI BRAIN SURGERY */}
        <div className="flex flex-col gap-6">
          <section className="bg-[#0a0a0a] border border-emerald-500/20 rounded-xl p-5 shadow-[0_0_30px_-15px_rgba(16,185,129,0.2)]">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                Justifikasi Random Forest
              </h2>
              <p className="text-xs text-gray-500 mt-1">Bobot keputusan AI (Feature Importance) untuk emiten ini.</p>
            </div>

            <div className="space-y-5">
              {Object.entries(features).length > 0 ? (
                Object.entries(features)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([name, weight]) => (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-gray-300 uppercase">
                        <span>{name.replace(/_/g, ' ')}</span>
                        <span className="text-emerald-400">{((weight as number) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000" 
                          style={{ width: `${(weight as number) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-gray-600 uppercase font-bold italic">Kalkulasi bobot tidak tersedia.</p>
                </div>
              )}
            </div>

            <div className="mt-8 p-3 rounded bg-white/5 border border-white/10">
              <p className="text-[11px] text-gray-400 leading-relaxed text-justify">
                <strong>Catatan Akademis:</strong> Diagram di atas membuktikan model tidak beroperasi sebagai <i>Black Box</i>. Angka persentase menunjukkan variabel independen mana yang paling dominan dalam memicu keputusan Grade {grade} pada simpul-simpul algoritma Random Forest.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}