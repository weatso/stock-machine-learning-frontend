"use client";

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Filter, BarChart2, ShieldCheck, Activity, AlertTriangle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url?: string;
  ai_grade: "A" | "B" | "C";
  latest_price?: number | null;
  margin_of_safety?: number | null;
  per?: number | null;
  pbv?: number | null;
  roa?: number | null;
  roe?: number | null;
}

export default function ScreenerClient({ stocks }: { stocks: Stock[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock; direction: 'asc' | 'desc' } | null>(null);
  const [strictMode, setStrictMode] = useState(true);

  const requestSort = (key: keyof Stock) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const processedStocks = useMemo(() => {
    let filtered = [...stocks];

    if (search) {
      filtered = filtered.filter(s => 
        s.ticker.toLowerCase().includes(search.toLowerCase()) || 
        s.company_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (strictMode) {
      filtered = filtered.filter(s => s.latest_price != null && s.per != null && s.margin_of_safety != null);
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered.map(stock => ({
      ...stock,
      margin_of_safety: stock.margin_of_safety != null ? Math.max(-999, Math.min(999, stock.margin_of_safety)) : null
    }));
  }, [stocks, search, sortConfig, strictMode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-indigo-500" /> Market Screener
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistem penyaringan kuantitatif dengan proteksi anomali data.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setStrictMode(!strictMode)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all w-full sm:w-auto ${
              strictMode 
              ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
              : 'bg-[#0a0a0a] border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            {strictMode ? "Strict Filter: ON" : "Strict Filter: OFF"}
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Cari Ticker / Nama Emiten..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
                <th className="px-5 py-4 font-bold cursor-pointer hover:text-white transition-colors w-64" onClick={() => requestSort('ticker')}>
                  <div className="flex items-center gap-2">Emiten <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-4 py-4 font-bold text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('latest_price')}>
                  <div className="flex items-center justify-end gap-2">Harga <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-4 py-4 font-bold text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('margin_of_safety')}>
                  <div className="flex items-center justify-end gap-2">Valuasi (MoS) <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-4 py-4 font-bold text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('per')}>
                  <div className="flex items-center justify-end gap-2">PER <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-4 py-4 font-bold text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('pbv')}>
                  <div className="flex items-center justify-end gap-2">PBV <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-4 py-4 font-bold text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('roa')}>
                  <div className="flex items-center justify-end gap-2">ROA <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-4 py-4 font-bold text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('roe')}>
                  <div className="flex items-center justify-end gap-2">ROE <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                {/* AI GRADE DIPINDAH KE KANAN */}
                <th className="px-6 py-4 font-bold text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('ai_grade')}>
                  <div className="flex items-center justify-center gap-2">AI Grade <ArrowUpDown className="w-3 h-3 opacity-50"/></div>
                </th>
                <th className="px-5 py-4 font-bold text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedStocks.map((stock) => {
                const mos = stock.margin_of_safety || 0;
                const isPositive = mos > 0;
                const absMos = Math.abs(mos);
                const barWidth = Math.min(100, (absMos / 100) * 100);

                return (
                  <tr 
                    key={stock.ticker} 
                    className="hover:bg-[#0a0a0a] transition-all group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* RESTORASI LOGO */}
                        {stock.logo_url ? (
                           <img src={stock.logo_url} alt={stock.ticker} className="w-8 h-8 rounded-full bg-white object-contain p-0.5 border border-white/10" />
                        ) : (
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                             <span className="text-xs font-bold text-white">{stock.ticker.substring(0,2)}</span>
                           </div>
                        )}
                        <div>
                          <div className="font-black text-white text-sm tracking-wide">{stock.ticker}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[140px] uppercase">{stock.company_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono text-sm text-gray-300">
                        {stock.latest_price ? stock.latest_price.toLocaleString('id-ID') : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {stock.margin_of_safety != null ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-mono text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}{mos.toFixed(1)}%
                          </span>
                          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden flex justify-end">
                            <div 
                              className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      ) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-xs text-gray-400">{stock.per ? stock.per.toFixed(2) : "-"}</td>
                    <td className="px-4 py-4 text-right font-mono text-xs text-gray-400">{stock.pbv ? stock.pbv.toFixed(2) : "-"}</td>
                    <td className="px-4 py-4 text-right font-mono text-xs text-gray-400">{stock.roa ? `${stock.roa.toFixed(1)}%` : "-"}</td>
                    <td className="px-4 py-4 text-right font-mono text-xs text-gray-400">{stock.roe ? `${stock.roe.toFixed(1)}%` : "-"}</td>
                    
                    {/* ELEGAN AI GRADE */}
                    <td className="px-6 py-4 text-center">
                      {stock.ai_grade === 'A' && (
                        <div className="inline-flex items-center gap-1.5 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          <ShieldCheck size={14} /> GRADE A
                        </div>
                      )}
                      {stock.ai_grade === 'B' && (
                        <div className="inline-flex items-center gap-1.5 border border-amber-500/50 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider">
                          <Activity size={14} /> GRADE B
                        </div>
                      )}
                      {stock.ai_grade === 'C' && (
                        <div className="inline-flex items-center gap-1.5 border border-rose-500/50 bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider">
                          <AlertTriangle size={14} /> GRADE C
                        </div>
                      )}
                    </td>

                    {/* KOLOM AKSI (TOMBOL DETAIL) */}
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/stocks/${stock.ticker}`); }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 text-gray-400 transition-colors border border-transparent hover:border-indigo-500/50"
                        title="Lihat Detail Analisis"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {processedStocks.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-500 text-sm bg-[#0a0a0a]">
                    Tidak ada emiten yang lolos filter pemindaian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}