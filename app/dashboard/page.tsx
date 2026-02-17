'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // PERBAIKAN: Import Router
import { Search, RefreshCw } from 'lucide-react';

interface Stock {
  ticker: string;
  company_name: string;
  market_cap: number;
  fundamental_per: number;
  fundamental_pbv: number;
  sectors: { name: string } | null;
}

export default function DashboardPage() {
  const router = useRouter(); // PERBAIKAN: Definisi Router
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?limit=50&sort_by=market_cap&order=desc`);
      const data = await res.json();
      if (data.data) setStocks(data.data);
    } catch (err) {
      console.error("Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const formatMoney = (val: number) => {
    if (!val) return "-";
    if (val >= 1_000_000_000_000) return `Rp ${(val / 1_000_000_000_000).toFixed(1)} T`;
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(0)} M`;
    return `Rp ${val}`;
  };

  const isGrahamGem = (per: number, pbv: number) => {
    return per > 0 && per < 15 && pbv > 0 && pbv < 1.5;
  };

  const filtered = stocks.filter(s => 
    s.ticker.toLowerCase().includes(search.toLowerCase()) || 
    (s.company_name && s.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stock Screener</h1>
          <p className="text-zinc-400 text-sm">Real-time valuation based on Graham's principles.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search ticker..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button onClick={fetchData} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-all cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Ticker</th>
                <th className="px-6 py-4 font-medium">Sector</th>
                <th className="px-6 py-4 font-medium text-right">Market Cap</th>
                <th className="px-6 py-4 font-medium text-right">PER (x)</th>
                <th className="px-6 py-4 font-medium text-right">PBV (x)</th>
                <th className="px-6 py-4 font-medium text-center">Graham Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-800 rounded w-20 ml-auto"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-800 rounded w-10 ml-auto"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-800 rounded w-10 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : (
                filtered.map((stock) => {
                  const isUndervalued = isGrahamGem(stock.fundamental_per, stock.fundamental_pbv);
                  
                  return (
                    <tr 
                      key={stock.ticker} 
                      onClick={() => router.push(`/dashboard/stocks/${stock.ticker}`)} // PERBAIKAN: Fungsi Klik
                      className="hover:bg-zinc-800/30 transition-colors group cursor-pointer border-b border-zinc-800/50 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{stock.ticker}</div>
                        <div className="text-xs text-zinc-500 truncate w-32">{stock.company_name}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {stock.sectors?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
                            {stock.sectors.name.replace(/_/g, ' ')}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-300">
                        {formatMoney(stock.market_cap)}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono ${
                        stock.fundamental_per > 0 && stock.fundamental_per < 15 ? 'text-green-400 font-bold' : 
                        stock.fundamental_per > 25 ? 'text-red-400' : 'text-zinc-300'
                      }`}>
                        {stock.fundamental_per ? stock.fundamental_per.toFixed(2) : '-'}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono ${
                        stock.fundamental_pbv > 0 && stock.fundamental_pbv < 1.5 ? 'text-green-400 font-bold' : 'text-zinc-300'
                      }`}>
                        {stock.fundamental_pbv ? stock.fundamental_pbv.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isUndervalued && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                            Undervalued
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <p>Tidak ada saham yang cocok dengan pencarian "{search}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}