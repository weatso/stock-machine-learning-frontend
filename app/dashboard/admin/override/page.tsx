"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { Database, Search, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

// Struktur data yang mencerminkan tabel daily_market_prices
interface PriceRecord {
  id: string;
  ticker: string;
  trade_date: string;
  raw_close: number;
  adjusted_close: number;
  is_manually_overridden: boolean;
}

export default function AdminOverridePage() {
  const [records, setRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState("");
  const [updateStatus, setUpdateStatus] = useState<{ id: string, status: 'saving' | 'success' | 'error' } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Menarik data 50 harga terakhir dari database
  const fetchRecords = async (tickerFilter = "") => {
    setLoading(true);
    let query = supabase
      .from("daily_market_prices")
      .select("id, ticker, trade_date, raw_close, adjusted_close, is_manually_overridden")
      .order("trade_date", { ascending: false })
      .limit(50);

    if (tickerFilter) {
      query = query.ilike("ticker", `%${tickerFilter.toUpperCase()}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setRecords(data as PriceRecord[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(searchTicker);
  };

  // Fungsi Krusial: Mengeksekusi Manual Override ke Database
  const handleOverride = async (id: string, newPrice: string) => {
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum)) return;

    setUpdateStatus({ id, status: 'saving' });

    try {
      const { error } = await supabase
        .from("daily_market_prices")
        .update({ 
          adjusted_close: priceNum,
          raw_close: priceNum, // Dalam skenario ini kita asumsikan raw dan adjusted sama untuk penyederhanaan
          is_manually_overridden: true // MENGUNCI DATA DARI TIMPAAN CRON JOB
        })
        .eq("id", id);

      if (error) throw error;
      
      setUpdateStatus({ id, status: 'success' });
      
      // Update state lokal agar UI langsung berubah tanpa refresh
      setRecords(records.map(r => 
        r.id === id ? { ...r, adjusted_close: priceNum, raw_close: priceNum, is_manually_overridden: true } : r
      ));

      setTimeout(() => setUpdateStatus(null), 3000);
    } catch (err) {
      console.error("Gagal melakukan override:", err);
      setUpdateStatus({ id, status: 'error' });
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-rose-500 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6" /> Data Override (Admin)
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Area mitigasi risiko. Ubah harga secara manual jika API pihak ketiga mengirimkan data anomali. Data yang diubah akan dikunci permanen dari pembaruan Cron Job.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Cari Ticker (ex: BBCA)"
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </form>
      </header>

      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar p-1">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Memuat data histori harga...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-[#111] border-b border-white/10 z-10 shadow-sm">
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-4">Ticker</th>
                  <th className="px-5 py-4">Tanggal (EOD)</th>
                  <th className="px-5 py-4 text-right">Harga Tersimpan</th>
                  <th className="px-5 py-4 text-right">Fundamental (PER/PBV)</th>
<th className="px-5 py-2 text-right">Profitability (ROA/ROE)</th>
                  <th className="px-5 py-4 text-center">Status Data</th>
                  <th className="px-5 py-4 text-right">Koreksi Manual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-bold text-white tracking-widest">{record.ticker}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{record.trade_date}</td>
                    <td className="px-5 py-3 text-right font-mono text-emerald-400">
                      {record.adjusted_close.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {record.is_manually_overridden ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> OVERRIDDEN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 border border-white/5 bg-white/5">
                          AUTO (API)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
  <div className="flex flex-col gap-1">
    <input type="number" placeholder="PER" className="w-20 bg-black border border-white/10 rounded px-2 py-1 text-[10px]" />
    <input type="number" placeholder="PBV" className="w-20 bg-black border border-white/10 rounded px-2 py-1 text-[10px]" />
  </div>
</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input 
                          type="number" 
                          id={`input-${record.id}`}
                          placeholder="Harga Baru"
                          className="w-28 bg-black border border-white/10 rounded px-2 py-1 text-xs text-right focus:outline-none focus:border-rose-500"
                          defaultValue={record.adjusted_close}
                        />
                        <button 
                          onClick={() => {
                            const inputElement = document.getElementById(`input-${record.id}`) as HTMLInputElement;
                            if (inputElement && inputElement.value) {
                              handleOverride(record.id, inputElement.value);
                            }
                          }}
                          disabled={updateStatus?.id === record.id}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded px-3 py-1 text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updateStatus?.id === record.id ? (
                            updateStatus.status === 'saving' ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                            updateStatus.status === 'success' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : 'Error'
                          ) : 'UPDATE'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {records.length === 0 && !loading && (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
              Tidak ada data harga yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}