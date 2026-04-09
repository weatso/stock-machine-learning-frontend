import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, Cpu, Activity } from "lucide-react";
import StockChart from "@/components/StockChart";
import ValuationHeatmap from "@/components/ValuationHeatmap";
import { supabase } from "@/lib/supabaseClient";

// Mesin Penarik Data Akurat ke API Baru
async function getStockDetail(ticker: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/stocks/${ticker}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Gagal menarik detail saham:", error);
    return null;
  }
}

function GradeBadge({ grade }: { grade: string }) {
  if (grade === "A") return <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"><ShieldCheck className="w-4 h-4" /> STRONG BUY (A)</span>;
  if (grade === "C") return <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold"><AlertTriangle className="w-4 h-4" /> STRONG SELL (C)</span>;
  return <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-bold">NEUTRAL (B)</span>;
}

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();
  const { data: fundamental } = await supabase
    .from('financial_reports')
    .select('per, pbv, roa, roe, period_date')
    .eq('ticker', ticker)
    .order('period_date', { ascending: false })
    .limit(1)
    .single();

  const data = await getStockDetail(ticker);

  if (!data) {
    return notFound(); // Lempar ke halaman 404 jika emiten tidak ada di database
  }

  const { identity, ai_analysis, latest_technical, historical_chart } = data;

  // Amankan data bobot AI (jika belum diprediksi, gunakan nilai kosong)
  const features = ai_analysis?.feature_importance || { rsi_14: 0, macd: 0, margin_of_safety: 0, mfi_14: 0 };

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-8 flex flex-col gap-6">
      {/* 1. HEADER NAVIGASI */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/stocks" className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 w-fit transition-colors">
            <ArrowLeft className="w-3 h-3" /> Kembali ke Screener
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden p-2">
              <Image src={identity.logo_url} alt={ticker} width={48} height={48} className="object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{ticker}</h1>
              <p className="text-sm text-gray-400">{identity.company_name} &bull; {identity.sector}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Machine Learning Output</p>
          <GradeBadge grade={ai_analysis?.predicted_grade || "B"} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* KOLOM KIRI: PILAR TEKNIKAL & FUNDAMENTAL */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Peta Panas Valuasi (Valuation Heatmap Anda) */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Pilar Fundamental (Valuation Heatmap)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">PER</p>
                <p className="text-xl font-mono text-white">{fundamental?.per?.toFixed(2) || "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">PBV</p>
                <p className="text-xl font-mono text-white">{fundamental?.pbv?.toFixed(2) || "-"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">ROA</p>
                <p className="text-xl font-mono text-emerald-400">{fundamental?.roa?.toFixed(1) || "-"}%</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">ROE</p>
                <p className="text-xl font-mono text-emerald-400">{fundamental?.roe?.toFixed(1) || "-"}%</p>
              </div>
            </div>
          </section>

          {/* Grafik Harga (StockChart Anda) */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Pilar Teknikal & Volume (T-100 Days)
            </h2>
            <div className="h-[400px] w-full border border-white/5 bg-black/50 rounded-lg overflow-hidden">
              {/* Kami menyuntikkan data harga murni ke komponen chart Anda */}
              <StockChart ticker={ticker} />
            </div>
          </section>

        </div>

        {/* KOLOM KANAN: THE AI BRAIN SURGERY (SANGAT PENTING UNTUK SKRIPSI) */}
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
              {/* Baris RSI */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-mono">RSI_14 (Momentum)</span>
                  <span className="text-emerald-400 font-mono">{(features.rsi_14 * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${features.rsi_14 * 100}%` }} />
                </div>
              </div>

              {/* Baris MACD */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-mono">MACD (Trend)</span>
                  <span className="text-cyan-400 font-mono">{(features.macd * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${features.macd * 100}%` }} />
                </div>
              </div>

              {/* Baris MFI (Volume) */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-mono">MFI_14 (Aliran Dana)</span>
                  <span className="text-indigo-400 font-mono">{(features.mfi_14 * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${features.mfi_14 * 100}%` }} />
                </div>
              </div>

              {/* Baris Margin of Safety */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-mono">Margin of Safety (Fundamental)</span>
                  <span className="text-amber-400 font-mono">{(features.margin_of_safety * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${features.margin_of_safety * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8 p-3 rounded bg-white/5 border border-white/10">
              <p className="text-[11px] text-gray-400 leading-relaxed text-justify">
                <strong>Catatan Akademis:</strong> Diagram di atas membuktikan model tidak beroperasi sebagai <i>Black Box</i>. Angka persentase menunjukkan variabel independen mana yang paling dominan dalam memicu keputusan {ai_analysis?.predicted_grade} pada simpul-simpul (<i>nodes</i>) pohon keputusan di algoritma Random Forest.
              </p>
            </div>
          </section>

          {/* Kotak Metrik Terkini */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 text-sm font-semibold text-white border-b border-white/10 pb-2 mb-2">Metrik Terakhir Terekam</div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Harga Terakhir</p>
              <p className="text-lg font-mono text-white">
                {historical_chart && historical_chart.length > 0 ? historical_chart[historical_chart.length - 1].raw_close.toLocaleString('id-ID') : "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Margin of Safety</p>
              <p className={`text-lg font-mono ${latest_technical?.margin_of_safety > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {latest_technical?.margin_of_safety?.toFixed(2)}%
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}