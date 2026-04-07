"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { Activity, Info } from "lucide-react";

export default function ModelHealthPage() {
  const [metrics, setMetrics] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchMetrics() {
      const { data } = await supabase
        .from("model_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setMetrics(data);
    }
    fetchMetrics();
  }, []);

  if (!metrics) return <div className="p-8 text-white">Memuat Data Kesehatan Model...</div>;

  // Kalkulasi Ratio Matrix
  const { tp, fp, tn, fn } = metrics.confusion_matrix;
  const total = tp + fp + tn + fn;
  const tpPct = ((tp / total) * 100).toFixed(1);
  const fpPct = ((fp / total) * 100).toFixed(1);
  const tnPct = ((tn / total) * 100).toFixed(1);
  const fnPct = ((fn / total) * 100).toFixed(1);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-8 h-8 text-indigo-500" /> Evaluasi Akademis Model (XAI)
        </h1>
        <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-3xl">
          Halaman ini bukan prediksi masa depan, melainkan <strong>Rapor Evaluasi (Backtest)</strong> dari mesin AI. Menggunakan metode <i>TimeSeriesSplit</i> (Out-of-Sample), metrik di bawah ini membuktikan seberapa cerdas model Random Forest membedakan saham yang benar-benar meroket (Grade A) dari saham sampah (Value Trap).
        </p>
      </header>

      {/* METRIK UTAMA (MACRO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 relative group cursor-help">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-gray-400 uppercase">Precision</h3>
            <Info className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="text-3xl font-mono text-white mt-2">{metrics.precision_score}%</p>
          <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block bg-indigo-950 border border-indigo-500/50 p-3 rounded text-xs text-indigo-100 z-10 w-72 shadow-xl">
            <strong>Konteks Penelitian:</strong> Dari seluruh emiten yang diprediksi mesin sebagai "Beli/Grade A", berapa persen yang BENAR-BENAR naik lebih dari target (8%)? Precision adalah tameng utama dari Value Trap (saham fundamental bagus tapi harga jatuh).
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 relative group cursor-help">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-gray-400 uppercase">Recall</h3>
            <Info className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="text-3xl font-mono text-white mt-2">{metrics.recall_score}%</p>
          <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block bg-indigo-950 border border-indigo-500/50 p-3 rounded text-xs text-indigo-100 z-10 w-72 shadow-xl">
            <strong>Konteks Penelitian:</strong> Dari seluruh saham yang secara realitas meroket naik di bursa, berapa banyak yang berhasil "ditangkap" oleh radar AI kita? Recall rendah berarti mesin kita terlalu penakut/konservatif.
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 relative group cursor-help">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-gray-400 uppercase">F1-Score</h3>
            <Info className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="text-3xl font-mono text-white mt-2">{metrics.f1_score}%</p>
          <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block bg-indigo-950 border border-indigo-500/50 p-3 rounded text-xs text-indigo-100 z-10 w-72 shadow-xl">
            <strong>Konteks Penelitian:</strong> Rata-rata harmonis antara Precision dan Recall. Karena kelas Grade A (saham sukses) sangat langka di bursa (Imbalanced Data), F1-Score adalah metrik yang jauh lebih akurat daripada sekadar melihat "Accuracy" biasa.
          </div>
        </div>
      </div>

      {/* CONFUSION MATRIX MICRO-ANALYSIS */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Bedah Matriks Kebingungan (Confusion Matrix)</h2>
          <p className="text-xs text-gray-500 mt-1">Total Populasi Evaluasi Historis: {total.toLocaleString('id-ID')} Keputusan Trading.</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visual Matrix */}
          <div className="flex flex-col">
             <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="bg-transparent border-none"></th>
                    <th className="bg-white/5 border border-white/10 p-2 text-center font-bold text-white w-1/2">AI Prediksi Naik (Grade A)</th>
                    <th className="bg-white/5 border border-white/10 p-2 text-center font-bold text-white w-1/2">AI Prediksi Stagnan/Jatuh</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-white/5 border border-white/10 p-2 text-right font-bold text-white whitespace-nowrap">Realitas NAIK</th>
                    <td className="border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                      <div className="text-2xl font-mono text-emerald-400 font-bold">{tp.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-emerald-400/70 font-bold uppercase mt-1">True Positive ({tpPct}%)</div>
                    </td>
                    <td className="border border-rose-500/30 bg-rose-500/5 p-4 text-center opacity-80">
                      <div className="text-xl font-mono text-rose-300">{fn.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-rose-300/70 font-bold uppercase mt-1">False Negative ({fnPct}%)</div>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-white/5 border border-white/10 p-2 text-right font-bold text-white whitespace-nowrap">Realitas JATUH</th>
                    <td className="border border-rose-500/30 bg-rose-500/10 p-4 text-center">
                      <div className="text-2xl font-mono text-rose-500 font-bold">{fp.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-rose-500/70 font-bold uppercase mt-1">False Positive ({fpPct}%)</div>
                    </td>
                    <td className="border border-zinc-500/30 bg-zinc-500/10 p-4 text-center">
                      <div className="text-xl font-mono text-zinc-300">{tn.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-zinc-400/70 font-bold uppercase mt-1">True Negative ({tnPct}%)</div>
                    </td>
                  </tr>
                </tbody>
             </table>
          </div>

          {/* Penjelasan Matrix */}
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1 flex justify-between">
                <span>True Positive (Kemenangan AI)</span>
                <span>{tpPct}% dari Total</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin menyuruh beli (Grade A), dan secara riil saham tersebut berhasil menembus target take profit &gt;8%. Semakin tinggi angka ini, semakin tajam radar algoritma kita mendeteksi saham potensial.
              </p>
            </div>
            
            <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
              <h4 className="text-xs font-bold text-rose-500 uppercase mb-1 flex justify-between">
                <span>False Positive (Jebakan / Value Trap)</span>
                <span>{fpPct}% dari Total</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin menyuruh beli (Grade A), tapi nyatanya harga saham stagnan atau anjlok menyentuh cutloss. Ini adalah "kerugian" finansial nyata jika diikuti. Fokus sistem ini adalah menekan angka ini sekecil mungkin.
              </p>
            </div>

            <div className="p-3 bg-zinc-500/5 border border-zinc-500/20 rounded-lg">
              <h4 className="text-xs font-bold text-zinc-400 uppercase mb-1 flex justify-between">
                <span>True Negative (Menghindari Peluru)</span>
                <span>{tnPct}% dari Total</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin mengklasifikasikan saham sebagai Grade B atau C (Jangan dibeli), dan nyatanya saham tersebut memang hancur di pasar. Mesin berhasil menyelamatkan modal investor.
              </p>
            </div>

            <div className="p-3 border border-rose-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-rose-300 uppercase mb-1 flex justify-between">
                <span>False Negative (Peluang Terlewat)</span>
                <span>{fnPct}% dari Total</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin takut menyuruh beli (diberi Grade B/C), tapi nyatanya saham itu meroket di luar dugaan. Ini tidak menyebabkan kerugian modal, hanya "Opportunity Cost" (kehilangan kesempatan profit).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}