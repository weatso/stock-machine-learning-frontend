"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { Database, Search, AlertTriangle, Edit2, X, RefreshCw } from "lucide-react";

interface PriceRecord {
  id: string;
  ticker: string;
  trade_date: string;
  adjusted_close: number;
  is_manually_overridden: boolean;
  // Fundamental Metrics
  per_ratio?: number;
  pbv_ratio?: number;
  roe_ratio?: number;
}

export default function AdminOverridePage() {
  const [records, setRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState("");
  
  // State untuk Modal
  const [selectedRecord, setSelectedRecord] = useState<PriceRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchRecords = async (tickerFilter = "") => {
    setLoading(true);
    let query = supabase.from("daily_market_prices").select("*").order("trade_date", { ascending: false }).limit(50);
    if (tickerFilter) query = query.ilike("ticker", `%${tickerFilter.toUpperCase()}%`);
    const { data } = await query;
    if (data) setRecords(data as PriceRecord[]);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleOverrideSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const newPrice = parseFloat(formData.get('price') as string);
    const newPer = parseFloat(formData.get('per') as string);
    
    try {
      await supabase.from("daily_market_prices").update({ 
          adjusted_close: newPrice,
          raw_close: newPrice,
          per_ratio: newPer || null, // Asumsi kolom per_ratio ada di database Anda
          is_manually_overridden: true 
        }).eq("id", selectedRecord.id);
      
      setRecords(records.map(r => r.id === selectedRecord.id ? { ...r, adjusted_close: newPrice, per_ratio: newPer, is_manually_overridden: true } : r));
      setSelectedRecord(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-[calc(100vh-4rem)] relative">
      <header className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-rose-500 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6" /> Koreksi Data Master (Override)
          </h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchRecords(searchTicker); }} className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Cari Ticker (ex: BBCA)" value={searchTicker} onChange={(e) => setSearchTicker(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white" />
        </form>
      </header>

      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-[#111] border-b border-white/10">
            <tr className="text-xs font-semibold text-gray-400 uppercase">
              <th className="px-5 py-4">Ticker</th>
              <th className="px-5 py-4 text-right">Harga (IDR)</th>
              <th className="px-5 py-4 text-right">PER / PBV</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-bold text-white">{record.ticker}</td>
                <td className="px-5 py-3 text-right font-mono text-emerald-400">{record.adjusted_close.toLocaleString('id-ID')}</td>
                <td className="px-5 py-3 text-right font-mono text-xs">{record.per_ratio || "-"} / {record.pbv_ratio || "-"}</td>
                <td className="px-5 py-3 text-center">
                  {record.is_manually_overridden ? 
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">OVERRIDDEN</span> : 
                    <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">AUTO</span>}
                </td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => setSelectedRecord(record)} className="p-1.5 rounded bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POP-UP MODAL OVERRIDE */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#111] border border-rose-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Edit2 className="w-4 h-4 text-rose-500"/> Edit Data: {selectedRecord.ticker}</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleOverrideSave} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">Koreksi Harga (EOD)</label>
                <input name="price" type="number" defaultValue={selectedRecord.adjusted_close} required className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Koreksi PER</label>
                  <input name="per" type="number" step="0.01" defaultValue={selectedRecord.per_ratio} className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Koreksi ROE (%)</label>
                  <input name="roe" type="number" step="0.01" defaultValue={selectedRecord.roe_ratio} className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-white font-mono" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setSelectedRecord(null)} className="flex-1 py-2.5 rounded-lg bg-white/5 text-white text-sm font-bold">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold flex justify-center items-center">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Simpan Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}