"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, AlertTriangle, ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";

interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url: string;
  ai_grade: "A" | "B" | "C";
  latest_price?: number;
  margin_of_safety?: number;
}

export default function ScreenerClient({ stocks }: { stocks: Stock[] }) {
  const [search, setSearch] = useState("");

  // Filter berdasarkan pencarian ticker atau nama
  const filteredStocks = stocks.filter(s => 
    s.ticker.toLowerCase().includes(search.toLowerCase()) || 
    s.company_name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.ai_grade < b.ai_grade ? -1 : 1));

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Market Kuantitatif</h1>
        <p className="text-sm text-gray-500 mb-4">Hasil klasifikasi algoritma Random Forest untuk probabilitas harga (T+5).</p>
        
        {/* Search Bar agar mudah dipakai */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Cari emiten atau ticker..."
            className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden flex flex-col mb-8">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 bg-[#151515] border-b border-white/10 z-10">
              <tr className="text-gray-400 uppercase tracking-tighter">
                <th className="px-4 py-3 font-medium">Emiten</th>
                <th className="px-4 py-3 font-medium">Sektor</th>
                <th className="px-4 py-3 text-right font-medium">Harga (IDR)</th>
                <th className="px-4 py-3 text-right font-medium">MoS (%)</th>
                <th className="px-4 py-3 text-center font-medium">Prediksi ML</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredStocks.map((stock) => (
                <tr key={stock.ticker} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {/* Logo Mini */}
                      <div className="w-7 h-7 rounded bg-white flex-shrink-0 flex items-center justify-center p-1">
                        <Image 
                          src={stock.logo_url || "https://storage.invezgo.com/icon/DEFAULT.png"} 
                          alt={stock.ticker} 
                          width={24} 
                          height={24} 
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase">{stock.ticker}</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{stock.company_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{stock.sector}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {stock.latest_price ? stock.latest_price.toLocaleString('id-ID') : "-"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {stock.margin_of_safety ? (
                      <span className={stock.margin_of_safety > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {stock.margin_of_safety.toFixed(2)}%
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {stock.ai_grade === "A" && <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">BUY</span>}
                    {stock.ai_grade === "B" && <span className="text-zinc-500 font-bold bg-zinc-500/10 px-2 py-0.5 rounded">HOLD</span>}
                    {stock.ai_grade === "C" && <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">SELL</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link 
                      href={`/dashboard/stocks/${stock.ticker}`}
                      className="text-emerald-500 hover:underline flex items-center justify-end gap-1"
                    >
                      Detail <ArrowUpRight className="w-3 h-3" />
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