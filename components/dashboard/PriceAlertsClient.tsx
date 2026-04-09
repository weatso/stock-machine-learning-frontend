"use client";

import { useState, useMemo } from 'react';
import { Bell, Search, TrendingUp, TrendingDown, Trash2, Plus, Info, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan jika path supabase Anda berbeda

interface Stock {
  ticker: string;
  name: string;
  logo_url?: string;
  current_price: number;
}

interface Alert {
  id: string;
  ticker: string;
  target_price: number;
  is_active: boolean;
}

export default function PriceAlertsClient({ allStocks, existingAlerts }: { allStocks: Stock[], existingAlerts: Alert[] }) {
  const [selectedTicker, setSelectedTicker] = useState("");
  const [targetPrice, setTargetPrice] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);

  // Cari data saham yang sedang dipilih
  const currentStock = useMemo(() => 
    allStocks.find(s => s.ticker === selectedTicker), 
  [selectedTicker, allStocks]);

  // LOGIKA SIMULASI (Bebas Error TS 2367)
  const simulation = useMemo(() => {
    // Validasi ketat: pastikan currentStock ada dan targetPrice adalah angka valid (> 0)
    if (!currentStock || !targetPrice) return null;
    
    const diff = Number(targetPrice) - currentStock.current_price;
    const percent = (diff / currentStock.current_price) * 100;
    
    return {
      diff,
      percent: percent.toFixed(2),
      isProfit: diff > 0
    };
  }, [currentStock, targetPrice]);

  const handleSaveAlert = async () => {
    if (!selectedTicker || !targetPrice) return;
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        setIsLoading(false);
        return;
    }

    const { error } = await supabase.from('price_alerts').insert({
      user_id: user.id,
      ticker: selectedTicker,
      target_price: Number(targetPrice),
      current_price_at_creation: currentStock?.current_price
    });

    if (error) {
      alert("Gagal menyimpan peringatan: " + error.message);
    } else {
      window.location.reload(); // Refresh untuk update daftar pantauan
    }
    setIsLoading(false);
  };

  const handleDeleteAlert = async (id: string) => {
    const { error } = await supabase.from('price_alerts').delete().eq('id', id);
    if (!error) {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Bell className="text-indigo-500" /> Price Alerts
        </h1>
        <p className="text-gray-500 mt-2">Pasang jaring harga dan dapatkan notifikasi otomatis.</p>
      </div>

      {/* FORM PEMBUATAN ALERT */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-indigo-400" /> Buat Alert Baru
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SEARCH DROPDOWN */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pilih Saham (Ticker)</label>
            <div className="relative">
              <select 
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="">-- Pilih Ticker Saham --</option>
                {allStocks.map(stock => (
                  <option key={stock.ticker} value={stock.ticker}>
                    {stock.ticker} - {stock.name}
                  </option>
                ))}
              </select>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={18} />
            </div>
          </div>

          {/* TARGET PRICE INPUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Harga (Rp)</label>
            <input 
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : "")}
              placeholder="Contoh: 10500"
              disabled={!selectedTicker}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* SIMULASI BOX */}
        {currentStock && (
          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={`/api/proxy-image?url=${encodeURIComponent(currentStock.logo_url || '')}`} 
                  alt={currentStock.ticker}
                  className="w-10 h-10 rounded-full bg-white p-1 object-contain"
                />
                <div>
                  <p className="text-white font-black">{currentStock.ticker}</p>
                  <p className="text-xs text-gray-500">Harga Saat Ini: Rp {currentStock.current_price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              
              {simulation && (
                <div className="text-right">
                  <p className={`text-sm font-bold flex items-center justify-end gap-1 ${simulation.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulation.isProfit ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                    {simulation.isProfit ? '+' : ''}{simulation.percent}%
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Estimasi {simulation.isProfit ? 'Profit' : 'Loss'}</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSaveAlert}
              disabled={isLoading || !targetPrice}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? "Menyimpan..." : "Aktifkan Peringatan Harga"}
            </button>
          </div>
        )}
      </div>

      {/* DAFTAR PANTAUAN AKTIF */}
      <div className="space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Activity size={18} className="text-gray-400" /> Daftar Pantauan Aktif
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {existingAlerts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
              <Info className="mx-auto text-gray-700 mb-2" />
              <p className="text-gray-600 text-sm">Belum ada alert yang dipasang.</p>
            </div>
          ) : (
            existingAlerts.map(alert => {
              const stockData = allStocks.find(s => s.ticker === alert.ticker);
              return (
                <div key={alert.id} className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(stockData?.logo_url || '')}`} 
                      className="w-8 h-8 rounded-full bg-white p-0.5 object-contain"
                    />
                    <div>
                      <p className="text-white font-bold text-sm">{alert.ticker}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Target: Rp {alert.target_price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Harga Sekarang</p>
                        <p className="text-sm font-mono text-white font-bold">
                          Rp {stockData?.current_price ? stockData.current_price.toLocaleString('id-ID') : "-"}
                        </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-gray-600 hover:text-rose-500 transition-colors"
                      title="Hapus Alert"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}