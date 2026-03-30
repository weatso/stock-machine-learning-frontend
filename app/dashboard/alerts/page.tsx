"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { Bell, Plus, Trash2, Activity, AlertCircle } from "lucide-react";

interface AlertRecord {
  id: string;
  ticker: string;
  target_price: number;
  is_triggered: boolean;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState("");
  const [newTargetPrice, setNewTargetPrice] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Dapatkan Identitas User (Karena alert bersifat personal)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchAlerts(user.id);
      }
    };
    getUser();
  }, []);

  // 2. Tarik Daftar Alert dari Database
  const fetchAlerts = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_watchlists") // Sesuai dengan ERD proposal Anda
      .select("id, ticker, alert_threshold_price, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Mapping data database ke interface lokal kita
      const mappedAlerts: AlertRecord[] = data.map(item => ({
        id: item.id,
        ticker: item.ticker,
        target_price: item.alert_threshold_price,
        is_triggered: false, // Status ini nantinya di-update oleh Cron Job, untuk sekarang kita set false di UI
        created_at: new Date(item.created_at).toLocaleDateString('id-ID')
      }));
      setAlerts(mappedAlerts);
    }
    setLoading(false);
  };

  // 3. Tambah Alert Baru
  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId) return;
    if (!newTicker || !newTargetPrice) {
      setErrorMsg("Ticker dan Harga Target wajib diisi.");
      return;
    }

    const priceNum = parseFloat(newTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("Harga target tidak valid.");
      return;
    }

    try {
      // Pastikan ticker berupa uppercase
      const tickerUpper = newTicker.toUpperCase();

      // Cek apakah emiten ada di master data (Opsional, tapi praktik yang baik)
      const { data: emitenCheck } = await supabase
        .from("emitens")
        .select("ticker")
        .eq("ticker", tickerUpper)
        .single();

      if (!emitenCheck) {
        throw new Error(`Emiten ${tickerUpper} tidak ditemukan di database master.`);
      }

      const { data, error } = await supabase
        .from("user_watchlists")
        .insert([
          { 
            user_id: userId, 
            ticker: tickerUpper, 
            alert_threshold_price: priceNum 
          }
        ])
        .select();

      if (error) throw error;

      // Bersihkan form & update list
      setNewTicker("");
      setNewTargetPrice("");
      if (data) fetchAlerts(userId);

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
      .eq("user_id", userId); // Lapis keamanan ganda

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
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">Ticker Saham</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                    placeholder="Contoh: BBCA"
                    className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">Target Harga (IDR)</label>
                <input 
                  type="number" 
                  value={newTargetPrice}
                  onChange={(e) => setNewTargetPrice(e.target.value)}
                  placeholder="Contoh: 8500"
                  className="w-full bg-[#111] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 mt-2 rounded-lg bg-white/5 hover:bg-emerald-500 border border-white/10 hover:border-emerald-500 text-white text-sm font-medium transition-all"
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
          
          <div className="flex-1 overflow-auto custom-scrollbar p-2">
            {loading ? (
              <div className="flex justify-center items-center h-40 text-gray-500 text-sm">Menarik data dari server...</div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                <Bell className="w-8 h-8 mb-3 opacity-20" />
                Anda belum memiliki peringatan harga aktif.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center border border-white/10">
                        <span className="font-bold text-white tracking-wider">{alert.ticker}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target Harga EOD</p>
                        <p className="text-lg font-mono text-emerald-400">Rp {alert.target_price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">Dibuat Pada</p>
                        <p className="text-xs text-gray-300">{alert.created_at}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 transition-colors"
                        title="Hapus Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}