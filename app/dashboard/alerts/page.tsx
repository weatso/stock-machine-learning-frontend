"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { Bell, Plus, Trash2, Activity, AlertCircle, Search, TrendingUp, TrendingDown, Info } from "lucide-react";

interface AlertRecord {
  id: string;
  ticker: string;
  target_price: number;
  is_triggered: boolean;
  created_at: string;
}

// Tambahkan interface Stock untuk dropdown dan simulasi
interface Stock {
  ticker: string;
  company_name: string;
  logo_url?: string;
  latest_price: number | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State form diubah untuk mendukung dropdown
  const [newTicker, setNewTicker] = useState("");
  const [newTargetPrice, setNewTargetPrice] = useState<number | "">("");
  
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Inisialisasi: Dapatkan User, Daftar Alert, dan Daftar Saham Master
  useEffect(() => {
    const initializeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchAlerts(user.id);
      }
      fetchStocks();
    };
    initializeData();
  }, []);

  // Ambil daftar saham dari FastAPI untuk dropdown
  const fetchStocks = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/stocks', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setAvailableStocks(json.data || []);
      }
    } catch (e) {
      console.error("Gagal mengambil data saham master");
    }
  };

  // 2. Tarik Daftar Alert dari Database
  const fetchAlerts = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_watchlists")
      .select("id, ticker, alert_threshold_price, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mappedAlerts: AlertRecord[] = data.map(item => ({
        id: item.id,
        ticker: item.ticker,
        target_price: item.alert_threshold_price,
        is_triggered: false,
        created_at: new Date(item.created_at).toLocaleDateString('id-ID')
      }));
      setAlerts(mappedAlerts);
    }
    setLoading(false);
  };

  // MENDAPATKAN DATA SAHAM YANG SEDANG DIPILIH (Untuk Simulasi)
  const currentStock = useMemo(() => 
    availableStocks.find(s => s.ticker === newTicker), 
  [newTicker, availableStocks]);

  // LOGIKA SIMULASI PROFIT/LOSS
  const simulation = useMemo(() => {
    if (!currentStock || !currentStock.latest_price || !newTargetPrice) return null;
    
    const diff = Number(newTargetPrice) - currentStock.latest_price;
    const percent = (diff / currentStock.latest_price) * 100;
    
    return {
      percent: percent.toFixed(2),
      isProfit: diff > 0
    };
  }, [currentStock, newTargetPrice]);


  // 3. Tambah Alert Baru
  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId) return;
    if (!newTicker || !newTargetPrice) {
      setErrorMsg("Ticker dan Harga Target wajib diisi.");
      return;
    }

    const priceNum = Number(newTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("Harga target tidak valid.");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_watchlists")
        .insert([{ user_id: userId, ticker: newTicker, alert_threshold_price: priceNum }]);

      if (error) throw error;

      setNewTicker("");
      setNewTargetPrice("");
      fetchAlerts(userId);

    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan alert.");
    }
  };

  // 4. Hapus Alert
  const handleDeleteAlert = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_watchlists")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Bell className="w-8 h-8 text-emerald-500" /> Price Alerts
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-2xl">
          Pantau pergerakan harga secara otomatis. Sistem akan menandai alert Anda jika harga EOD harian menyentuh atau melampaui target yang Anda tentukan.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        
        {/* Kolom Kiri: Form Tambah Alert */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Buat Alert Baru
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-400">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleAddAlert} className="space-y-4">
              {/* REVISI: Input Text diganti Dropdown */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">Pilih Saham</label>
                <div className="relative">
                  <select 
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 pl-3 pr-8 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Ticker --</option>
                    {availableStocks.map(s => (
                      <option key={s.ticker} value={s.ticker}>{s.ticker} - {s.company_name}</option>
                    ))}
                  </select>
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">Target Harga (IDR)</label>
                <input 
                  type="number" 
                  value={newTargetPrice}
                  onChange={(e) => setNewTargetPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Contoh: 8500"
                  disabled={!newTicker}
                  className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
                  required
                />
              </div>

              {/* REVISI: BOX SIMULASI MUNCUL JIKA SAHAM DIPILIH */}
              {currentStock && (
                <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {currentStock.logo_url ? (
                        <img 
                          src={`/api/proxy-image?url=${encodeURIComponent(currentStock.logo_url)}`} 
                          className="w-8 h-8 rounded-full bg-white p-0.5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{currentStock.ticker.substring(0,2)}</div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Harga Terakhir</p>
                        <p className="text-sm text-white font-mono font-bold">
                          {currentStock.latest_price ? `Rp ${currentStock.latest_price.toLocaleString('id-ID')}` : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {simulation && (
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Estimasi</span>
                      <span className={`text-sm font-bold flex items-center gap-1 ${simulation.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {simulation.isProfit ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                        {simulation.isProfit ? '+' : ''}{simulation.percent}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={!newTargetPrice}
                className="w-full py-2.5 mt-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-500 border border-emerald-500/50 hover:border-emerald-500 text-emerald-400 hover:text-white text-sm font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Target Pantauan
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Alert Aktif */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-[#111]">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Daftar Pantauan Anda</h2>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-3">
            {loading ? (
              <div className="flex justify-center items-center h-40 text-gray-500 text-sm animate-pulse">Menarik data dari server...</div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                <Bell className="w-8 h-8 mb-3 opacity-20" />
                Anda belum memiliki peringatan harga aktif.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  // Cari info tambahan (logo & harga sekarang) dari master saham
                  const stockInfo = availableStocks.find(s => s.ticker === alert.ticker);

                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111] border border-white/5 hover:border-white/20 transition-all group">
                      <div className="flex items-center gap-4">
                        {stockInfo?.logo_url ? (
                          <img 
                            src={`/api/proxy-image?url=${encodeURIComponent(stockInfo.logo_url)}`} 
                            className="w-10 h-10 rounded-full bg-white p-1 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="font-bold text-white tracking-wider text-xs">{alert.ticker}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider">{alert.ticker}</p>
                          <p className="text-lg font-mono text-emerald-400 font-bold">Rp {alert.target_price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Harga Saat Ini</p>
                          <p className="text-sm text-gray-300 font-mono">
                            {stockInfo?.latest_price ? `Rp ${stockInfo.latest_price.toLocaleString('id-ID')}` : 'Menunggu data...'}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                        <button 
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-2 rounded hover:bg-rose-500/10 text-gray-600 hover:text-rose-500 transition-colors"
                          title="Hapus Alert"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}