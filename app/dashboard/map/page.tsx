'use client';

import { useEffect, useState } from 'react';
import ValuationHeatmap from '@/components/ValuationHeatmap';
import { RefreshCw } from 'lucide-react';

export default function MarketMapPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      // Ambil 100 saham terbesar saja agar Heatmap tidak meledak (kebanyakan kotak)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks?limit=100&sort_by=market_cap&order=desc`);
      const json = await res.json();
      if (json.data) setStocks(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Valuation Map</h1>
          <p className="text-zinc-400 text-sm">Visualisasi 100 saham terbesar berdasarkan Market Cap & Valuasi Graham.</p>
        </div>
        <button onClick={fetchData} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900/30 border border-zinc-800 rounded-xl animate-pulse">
            <span className="text-zinc-500">Memetakan pasar...</span>
          </div>
        ) : (
          <ValuationHeatmap data={stocks} />
        )}
      </div>
    </div>
  );
}