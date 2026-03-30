"use client";

// PINTU MASUK TICKER
interface HeatmapProps {
  ticker: string;
}

export default function ValuationHeatmap({ ticker }: HeatmapProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
      <div className="w-20 h-20 mb-4 grid grid-cols-2 gap-1 rotate-45">
        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-sm animate-pulse"></div>
        <div className="bg-rose-500/20 border border-rose-500/40 rounded-sm"></div>
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-sm"></div>
        <div className="bg-emerald-500/40 border border-emerald-500/60 rounded-sm"></div>
      </div>
      <p className="font-mono text-sm mt-4">Intrinsic Valuation: <span className="text-white font-bold">{ticker}</span></p>
      <p className="text-[10px] mt-1 opacity-50 text-center max-w-[200px]">
        Integrasi metrik fundamental lanjutan sedang dipersiapkan.
      </p>
    </div>
  );
}