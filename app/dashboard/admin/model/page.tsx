import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Activity, Info, AlertTriangle } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic'; // Paksa selalu ambil data terbaru dari database

export default async function ModelHealthPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 1. Tarik Data dengan Aman (Tanpa .single() yang rawan crash)
  const { data: metricsData, error } = await supabase
    .from("model_metrics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  // 2. Pertahanan Error Brutal
  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto mt-10 bg-rose-500/10 border border-rose-500/30 rounded-xl">
        <h2 className="text-rose-500 font-bold flex items-center gap-2"><AlertTriangle /> Error Database</h2>
        <p className="text-gray-400 mt-2 text-sm">{error.message}</p>
        <p className="text-gray-500 mt-4 text-xs">Pastikan RLS (Row Level Security) pada tabel model_metrics sudah dinonaktifkan di Supabase.</p>
      </div>
    );
  }

  const metrics = metricsData && metricsData.length > 0 ? metricsData[0] : null;

  // 3. Pertahanan Jika Data Kosong
  if (!metrics) {
    return (
      <div className="p-8 max-w-3xl mx-auto mt-10 bg-zinc-900 border border-white/10 rounded-xl text-center">
        <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-white font-bold">Data Evaluasi Belum Tersedia</h2>
        <p className="text-gray-400 mt-2 text-sm">Jalankan script worker_ml_model.py di backend Anda untuk mencetak matriks evaluasi pertama.</p>
      </div>
    );
  }

  // 4. Kalkulasi Matrix (Hanya Dieksekusi Jika Data Aman)
  const { tp, fp, tn, fn } = metrics.confusion_matrix;
  const total = tp + fp + tn + fn;
  const tpPct = ((tp / total) * 100).toFixed(1);
  const fpPct = ((fp / total) * 100).toFixed(1);
  const tnPct = ((tn / total) * 100).toFixed(1);
  const fnPct = ((fn / total) * 100).toFixed(1);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500" /> Evaluasi Akademis Model (XAI)
        </h1>
        <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-3xl">
          Halaman ini bukan prediksi masa depan, melainkan <strong>Rapor Evaluasi (Backtest)</strong> dari mesin AI. Menggunakan metode <i className="text-indigo-400">TimeSeriesSplit</i> (Out-of-Sample), metrik di bawah ini membuktikan seberapa presisi model Random Forest mendeteksi saham Grade A yang sesungguhnya.
        </p>
      </header>

      {/* METRIK UTAMA (MACRO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050505] shadow-2xl border border-white/10 rounded-xl p-6 relative group cursor-help transition-all hover:border-indigo-500/50">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Precision</h3>
            <Info className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="text-4xl font-mono font-black text-white mt-3">{metrics.precision_score}%</p>
          <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block bg-[#0a0a0a] border border-indigo-500/30 p-4 rounded-lg text-xs text-gray-300 z-10 shadow-2xl">
            <strong className="text-indigo-400 block mb-1">Konteks Skripsi:</strong> Dari seluruh emiten yang direkomendasikan AI untuk "Beli", berapa persen yang BENAR-BENAR menembus target take profit? Ini adalah metrik terpenting untuk menghindari Value Trap.
          </div>
        </div>

        <div className="bg-[#050505] shadow-2xl border border-white/10 rounded-xl p-6 relative group cursor-help transition-all hover:border-indigo-500/50">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recall</h3>
            <Info className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="text-4xl font-mono font-black text-white mt-3">{metrics.recall_score}%</p>
          <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block bg-[#0a0a0a] border border-indigo-500/30 p-4 rounded-lg text-xs text-gray-300 z-10 shadow-2xl">
            <strong className="text-indigo-400 block mb-1">Konteks Skripsi:</strong> Dari semua saham luar biasa yang terbang di bursa, berapa banyak yang berhasil ditangkap oleh radar AI? Recall rendah berarti model terlalu konservatif/penakut.
          </div>
        </div>

        <div className="bg-[#050505] shadow-2xl border border-white/10 rounded-xl p-6 relative group cursor-help transition-all hover:border-indigo-500/50">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">F1-Score</h3>
            <Info className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="text-4xl font-mono font-black text-white mt-3">{metrics.f1_score}%</p>
          <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block bg-[#0a0a0a] border border-indigo-500/30 p-4 rounded-lg text-xs text-gray-300 z-10 shadow-2xl">
            <strong className="text-indigo-400 block mb-1">Konteks Skripsi:</strong> Rata-rata harmonis antara Precision dan Recall. Karena data kelas saham meroket sangat sedikit (Imbalanced Data), F1-Score digunakan menggantikan Akurasi standar.
          </div>
        </div>
      </div>

      {/* CONFUSION MATRIX MICRO-ANALYSIS */}
      <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-[#0a0a0a]">
          <h2 className="text-lg font-black text-white">Bedah Matriks Kebingungan (Confusion Matrix)</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Populasi Evaluasi Historis: <span className="text-indigo-400">{total.toLocaleString('id-ID')} Keputusan Trading</span></p>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Visual Matrix */}
          <div className="flex flex-col justify-center">
             <table className="w-full text-sm border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th className="bg-transparent border-none"></th>
                    <th className="bg-white/5 p-3 text-center text-[10px] uppercase font-bold text-gray-400 w-1/2 rounded-t-lg">Prediksi AI: NAIK</th>
                    <th className="bg-white/5 p-3 text-center text-[10px] uppercase font-bold text-gray-400 w-1/2 rounded-t-lg">Prediksi AI: JATUH</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-white/5 p-3 text-right text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap rounded-l-lg">Realitas: NAIK</th>
                    <td className="bg-emerald-500/10 p-6 text-center border border-emerald-500/30 rounded shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="text-3xl font-mono text-emerald-400 font-black">{tp.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest mt-2">True Positive</div>
                    </td>
                    <td className="bg-rose-500/5 p-6 text-center border border-rose-500/10 rounded opacity-60">
                      <div className="text-xl font-mono text-rose-300">{fn.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-rose-300/80 font-bold uppercase tracking-widest mt-2">False Negative</div>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-white/5 p-3 text-right text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap rounded-l-lg">Realitas: JATUH</th>
                    <td className="bg-rose-500/10 p-6 text-center border border-rose-500/30 rounded shadow-[inset_0_0_20px_rgba(244,63,94,0.05)] relative overflow-hidden">
                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                      <div className="text-3xl font-mono text-rose-500 font-black">{fp.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-rose-500/80 font-bold uppercase tracking-widest mt-2">False Positive</div>
                    </td>
                    <td className="bg-zinc-500/10 p-6 text-center border border-zinc-500/30 rounded">
                      <div className="text-xl font-mono text-zinc-300">{tn.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-zinc-400/80 font-bold uppercase tracking-widest mt-2">True Negative</div>
                    </td>
                  </tr>
                </tbody>
             </table>
          </div>

          {/* Penjelasan Matrix */}
          <div className="space-y-4 flex flex-col justify-center">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-colors">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>True Positive (Kemenangan AI)</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded">{tpPct}%</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin menyuruh beli (Grade A), dan secara riil saham tersebut berhasil menembus target. Semakin tinggi angka ini, semakin tajam radar algoritma mendeteksi saham potensial.
              </p>
            </div>
            
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 transition-colors">
              <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2 flex justify-between">
                <span>False Positive (Value Trap)</span>
                <span className="bg-rose-500/20 px-2 py-0.5 rounded">{fpPct}%</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin sangat yakin menyuruh beli, tapi nyatanya harga saham anjlok (Cutloss). Ini adalah kerugian finansial nyata. Fokus model kuantitatif ini adalah menekan angka ini sekecil mungkin.
              </p>
            </div>

            <div className="p-4 border border-zinc-500/20 rounded-xl bg-zinc-500/5">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>True Negative (Menghindari Peluru)</span>
                <span className="bg-zinc-500/20 px-2 py-0.5 rounded text-zinc-300">{tnPct}%</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mesin mengklasifikasikan saham sebagai Grade C (Hindari), dan nyatanya saham tersebut memang hancur di pasar. Mesin berhasil menyelamatkan modal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}