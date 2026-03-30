"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, AlertTriangle, ArrowUpRight, Search, ArrowUpDown, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";

// Menambahkan metrik fundamental sesuai revisi
interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url: string;
  ai_grade: "A" | "B" | "C";
  latest_price?: number | null;
  margin_of_safety?: number | null;
  per?: number | null;
  pbv?: number | null;
  roe?: number | null;
}

export default function ScreenerClient({ stocks }: { stocks: Stock[] }) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: keyof Stock) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(s => 
      s.ticker.toLowerCase().includes(search.toLowerCase()) || 
      s.sector.toLowerCase().includes(search.toLowerCase())
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key] ?? (sortConfig.direction === 'asc' ? Infinity : -Infinity);
        let bValue = b[sortConfig.key] ?? (sortConfig.direction === 'asc' ? Infinity : -Infinity);
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      filtered.sort((a, b) => (a.ai_grade < b.ai_grade ? -1 : a.ai_grade > b.ai_grade ? 1 : 0));
    }
    return filtered;
  }, [stocks, search, sortConfig]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-6 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-1">Market <span className="font-medium text-emerald-500">Screener</span></h1>
          <p className="text-sm text-gray-500">Prediksi T+20 (Sebulan) berbasis Integrasi Fundamental & Teknikal.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" placeholder="Cari emiten atau sektor..."
            className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:ring-1 focus:ring-emerald-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 bg-[#111] border-b border-white/10 z-10 shadow-sm cursor-pointer select-none">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 hover:bg-white/5" onClick={() => requestSort('ticker')}>Emiten</th>
                <th className="px-4 py-3 text-right hover:bg-white/5" onClick={() => requestSort('latest_price')}>Harga</th>
                <th className="px-4 py-3 text-right hover:bg-white/5" onClick={() => requestSort('per')}>PER (x)</th>
                <th className="px-4 py-3 text-right hover:bg-white/5" onClick={() => requestSort('pbv')}>PBV (x)</th>
                <th className="px-4 py-3 text-right hover:bg-white/5" onClick={() => requestSort('roe')}>ROE (%)</th>
                <th className="px-4 py-3 text-right hover:bg-white/5" onClick={() => requestSort('margin_of_safety')}>MoS (%)</th>
                <th className="px-4 py-3 text-center hover:bg-white/5" onClick={() => requestSort('ai_grade')}>Prediksi T+20</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredAndSortedStocks.map((stock) => (
                <tr key={stock.ticker} className={`hover:bg-white/[0.03] transition-colors ${stock.ai_grade === "A" ? "bg-emerald-900/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                        <Image src={stock.logo_url || "https://storage.invezgo.com/icon/DEFAULT.png"} alt={stock.ticker} width={28} height={28} className="object-contain" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-wide">{stock.ticker}</span>
                        <span className="text-[9px] text-gray-500 truncate max-w-[120px]">{stock.sector}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{stock.latest_price?.toLocaleString('id-ID') || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{stock.per ? stock.per.toFixed(2) : "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{stock.pbv ? stock.pbv.toFixed(2) : "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{stock.roe ? `${stock.roe.toFixed(1)}%` : "-"}</td>
                  
                  {/* Peringatan Anomali MOS sesuai Revisi 3 */}
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {stock.margin_of_safety === null || stock.margin_of_safety === undefined ? (
                      <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded" title="Data Laporan Keuangan Tidak Lengkap/Anomali">
                        <AlertCircle className="w-3 h-3" /> N/A
                      </span>
                    ) : (
                      <span className={stock.margin_of_safety > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {stock.margin_of_safety > 0 ? "+" : ""}{stock.margin_of_safety.toFixed(2)}%
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {stock.ai_grade === "A" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="w-3 h-3" /> BUY (A)</span>}
                    {stock.ai_grade === "B" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"><div className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> HOLD (B)</span>}
                    {stock.ai_grade === "C" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertTriangle className="w-3 h-3" /> SELL (C)</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/stocks/${stock.ticker}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 rounded transition-colors">
                      Analisis <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}