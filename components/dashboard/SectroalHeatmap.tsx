"use client";
import { useMemo } from "react";
import { Layers } from "lucide-react";

export default function SectoralHeatmap({ screenerData }: { screenerData: any[] }) {
  const sectorAnalysis = useMemo(() => {
    if (!screenerData || screenerData.length === 0) return [];
    
    const groups: Record<string, { count: number, totalMos: number, gradeA: number }> = {};
    
    screenerData.forEach(s => {
      const sector = s.sector || 'Uncategorized';
      if (!groups[sector]) groups[sector] = { count: 0, totalMos: 0, gradeA: 0 };
      
      groups[sector].count += 1;
      // Clamp MoS antara -100 dan 100 untuk agregasi visual yang masuk akal
      const mos = s.margin_of_safety != null ? Math.max(-100, Math.min(100, s.margin_of_safety)) : 0;
      groups[sector].totalMos += mos;
      if (s.ai_grade === 'A') groups[sector].gradeA += 1;
    });

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        avgMos: data.totalMos / data.count,
        count: data.count,
        gradeAPct: (data.gradeA / data.count) * 100
      }))
      .sort((a, b) => b.avgMos - a.avgMos); // Urutkan dari sektor paling Undervalued
  }, [screenerData]);

  if (sectorAnalysis.length === 0) return null;

  return (
    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 shadow-2xl col-span-1 lg:col-span-3">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Sectoral Flow Heatmap
          </h2>
          <p className="text-xs text-gray-500 mt-1">Agregasi Valuasi (Margin of Safety) berbasis Sektor Industri.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sectorAnalysis.map(sec => {
          const isUndervalued = sec.avgMos > 0;
          const intensity = Math.min(100, Math.abs(sec.avgMos));
          
          // Warna Heatmap: Hijau untuk Undervalued (Murah), Merah untuk Overvalued (Mahal)
          const bgColor = isUndervalued 
            ? `rgba(16, 185, 129, ${0.1 + (intensity/100) * 0.4})` 
            : `rgba(244, 63, 94, ${0.1 + (intensity/100) * 0.4})`;
          const borderColor = isUndervalued ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)';

          return (
            <div key={sec.name} className="p-3 rounded-xl border relative overflow-hidden group cursor-help transition-all hover:scale-105"
                 style={{ backgroundColor: bgColor, borderColor: borderColor }}>
              <div className="relative z-10">
                <p className="text-[10px] text-gray-300 uppercase font-bold truncate pr-4">{sec.name}</p>
                <p className={`text-xl font-mono font-black mt-1 ${isUndervalued ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUndervalued ? '+' : ''}{sec.avgMos.toFixed(1)}%
                </p>
                <div className="mt-2 flex justify-between items-center text-[9px] text-gray-400">
                  <span>{sec.count} Emiten</span>
                  <span className="text-indigo-300 font-bold">{sec.gradeAPct.toFixed(0)}% Sinyal Buy</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}