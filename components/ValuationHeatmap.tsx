"use client";

interface HeatmapProps {
  ticker: string;
  fundamentalData?: { per: number; pbv: number; roe: number; mos: number };
}

export default function ValuationHeatmap({ ticker, fundamentalData }: HeatmapProps) {
  // Jika data belum disuntikkan dari Backend Python Anda
  if (!fundamentalData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <p className="font-mono text-sm mt-4">Menunggu Ekstraksi Data: <span className="text-white font-bold">{ticker}</span></p>
        <p className="text-[10px] mt-1 opacity-50 text-center max-w-[200px]">Data Fundamental belum dikalkulasi oleh Pipeline Python.</p>
      </div>
    );
  }

  // Visualisasi Metrik Aktual
  return (
    <div className="w-full p-2 flex flex-col gap-4">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Profitability (ROE)</span>
          <span className="text-emerald-400 font-mono">{fundamentalData.roe}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(Math.max(fundamentalData.roe, 0), 100)}%` }} />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Valuation (PER)</span>
          <span className="text-amber-400 font-mono">{fundamentalData.per}x</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex justify-end">
           {/* Semakin kecil PER, bar semakin ke kiri (murah). Semakin besar, ke kanan (mahal) */}
          <div className="h-full bg-amber-500" style={{ width: `${Math.min((fundamentalData.per / 50) * 100, 100)}%` }} />
        </div>
      </div>

      <div className="mt-2 p-3 bg-black/50 border border-white/5 rounded-lg text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Margin of Safety</p>
        <p className={`text-xl font-mono font-bold ${fundamentalData.mos > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {fundamentalData.mos}%
        </p>
      </div>
    </div>
  );
}