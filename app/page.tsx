import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Activity, ShieldCheck, AlertTriangle, TrendingUp, BarChart3, PieChart, Layers } from "lucide-react";

export const revalidate = 0; // Memaksa Next.js untuk selalu menarik data terbaru (No Cache)

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 1. Tarik Data Mentah dari Database
  const [
    { data: emitens },
    { data: predictions },
    { data: alerts },
    { data: latestMetric }
  ] = await Promise.all([
    supabase.from('emitens').select('ticker, sector'),
    supabase.from('ml_predictions').select('ticker, predicted_grade'),
    supabase.from('user_watchlists').select('id', { count: 'exact' }),
    supabase.from('model_metrics').select('precision_score').order('training_date', { ascending: false }).limit(1).single()
  ]);

  // 2. Mesin Agregasi Data (Menghitung Statistik Pasar)
  const totalEmiten = emitens?.length || 0;
  const totalAlerts = alerts?.length || 0;
  const accuracy = latestMetric ? `${latestMetric.precision_score}%` : "N/A";

  let gradeA = 0, gradeB = 0, gradeC = 0;
  const sectorCounts: Record<string, number> = {};

  // Pemetaan Sektor ke Ticker untuk pencarian cepat
  const tickerToSector: Record<string, string> = {};
  if (emitens) {
    emitens.forEach(e => { tickerToSector[e.ticker] = e.sector || 'Unknown'; });
  }

  // Kalkulasi Distribusi Grade & Sektor Potensial
  if (predictions) {
    predictions.forEach(p => {
      if (p.predicted_grade === 'A') {
        gradeA++;
        const sector = tickerToSector[p.ticker];
        if (sector) {
          sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        }
      }
      else if (p.predicted_grade === 'B') gradeB++;
      else if (p.predicted_grade === 'C') gradeC++;
    });
  }

  const totalPredictions = gradeA + gradeB + gradeC;
  const pctA = totalPredictions ? ((gradeA / totalPredictions) * 100).toFixed(1) : 0;
  const pctB = totalPredictions ? ((gradeB / totalPredictions) * 100).toFixed(1) : 0;
  const pctC = totalPredictions ? ((gradeC / totalPredictions) * 100).toFixed(1) : 0;

  // Mengurutkan sektor dari yang paling banyak sinyal 'A'
  const topSectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Ambil 5 sektor teratas

  return (
    <div className="p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Market Intelligence</h1>
        <p className="text-sm text-gray-500">Agregasi hasil komputasi T+20 berbasis Model Random Forest & Data Fundamental Terkini.</p>
      </header>

      {/* Baris 1: Kartu Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center gap-4 transition-all hover:border-white/10">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Emiten Terkalkulasi</p>
            <p className="text-2xl font-mono text-white leading-none mt-1">{totalPredictions}</p>
          </div>
        </div>
        <div className="p-6 bg-[#0a0a0a] border border-emerald-500/20 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_-10px_rgba(16,185,129,0.2)]">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <p className="text-[11px] text-emerald-500/70 uppercase font-bold tracking-wider">Sinyal Buy (Grade A)</p>
            <p className="text-2xl font-mono text-emerald-500 leading-none mt-1">{gradeA}</p>
          </div>
        </div>
        <div className="p-6 bg-[#0a0a0a] border border-rose-500/20 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-[11px] text-rose-500/70 uppercase font-bold tracking-wider">Sinyal Sell (Grade C)</p>
            <p className="text-2xl font-mono text-rose-500 leading-none mt-1">{gradeC}</p>
          </div>
        </div>
        <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">Akurasi AI (Precision)</p>
            <p className="text-2xl font-mono text-white leading-none mt-1">{accuracy}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Kolom Kiri: Distribusi Keputusan AI */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" /> Distribusi Klasifikasi Pasar
          </h2>

          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400 font-bold">Grade A (Potensi &gt; 8%)</span>
              <span className="text-emerald-400 font-mono">{pctA}% ({gradeA} Emiten)</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${pctA}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400 font-bold">Grade B (Stagnan / Hold)</span>
              <span className="text-amber-400 font-mono">{pctB}% ({gradeB} Emiten)</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${pctB}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400 font-bold">Grade C (Risiko Cutloss / Sell)</span>
              <span className="text-rose-400 font-mono">{pctC}% ({gradeC} Emiten)</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${pctC}%` }} />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 mt-6 leading-relaxed">
          *Metrik ini memvisualisasikan hukum keseimbangan pasar. Sinyal Grade A secara persentase selalu menjadi minoritas (Imbalanced Data), menunjukkan bahwa mencari peluang Value Investing murni di bursa memerlukan penyaringan fundamental berlapis.
        </p>
      </div>

      {/* Kolom Kanan: Sektor Potensial */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" /> Top Sektor (Berdasarkan Sinyal Grade A)
        </h2>

        <div className="space-y-4">
          {topSectors.length > 0 ? (
            topSectors.map(([sector, count], index) => {
              // Kalkulasi visual bar relatif terhadap sektor tertinggi
              const maxCount = topSectors[0][1];
              const barWidth = Math.max((count / maxCount) * 100, 5);

              return (
                <div key={sector} className="p-3 bg-[#111] border border-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-300">
                      {index + 1}. {sector}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {count} Saham
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 text-center py-10">
              Menunggu ekstraksi data sektoral...
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-6 leading-relaxed">
          *Peringkat sektor menunjukkan aliran dana (capital inflow) dan kondisi fundamental makroekonomi yang sedang undervalued berdasarkan pembacaan algoritma (PER, PBV, ROE).
        </p>
      </div>

    </div>
    </div >
  );
}