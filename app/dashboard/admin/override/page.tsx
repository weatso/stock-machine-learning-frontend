"use client";

import { useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { Database, Search, Save, AlertTriangle } from "lucide-react";

export default function DataOverridePage() {
  const [ticker, setTicker] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [tableType, setTableType] = useState<"financial_reports" | "daily_market_prices">("financial_reports");
  
  const [record, setRecord] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [status, setStatus] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSearch = async () => {
    setStatus("Mencari data...");
    setRecord(null);
    setIsEditing(false);
    
    if (!ticker || !targetDate) {
      setStatus("Ticker dan Tanggal wajib diisi.");
      return;
    }

    const dateColumn = tableType === 'financial_reports' ? 'period_date' : 'trade_date';

    const { data, error } = await supabase
      .from(tableType)
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .eq(dateColumn, targetDate)
      .single();

    if (error) {
      setStatus(`Data tidak ditemukan: ${error.message}`);
    } else {
      setRecord(data);
      setEditForm(data);
      setStatus("Data ditemukan. Klik ganda pada sel untuk mengedit.");
    }
  };

  const handleSave = async () => {
    setStatus("Menyimpan ke database...");
    const dateColumn = tableType === 'financial_reports' ? 'period_date' : 'trade_date';
    
    // Jangan izinkan update primary keys
    const { ticker: t, [dateColumn]: d, id, created_at, ...updatePayload } = editForm;

    const { error } = await supabase
      .from(tableType)
      .update(updatePayload)
      .eq('ticker', ticker.toUpperCase())
      .eq(dateColumn, targetDate);

    if (error) {
      setStatus(`Gagal menyimpan: ${error.message}`);
    } else {
      setStatus("✅ Data berhasil di-override secara permanen.");
      setRecord(editForm);
      setIsEditing(false);
      
      // Mengingatkan user untuk refresh materialized view
      alert("PENTING: Eksekusi 'REFRESH MATERIALIZED VIEW public.screener_view;' di SQL Editor agar perubahan ini muncul di Dashboard.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Database className="w-8 h-8 text-rose-500" /> Data Override Matrix
        </h1>
        <p className="text-gray-400 mt-2 text-sm bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>Halaman ini memotong jalur Machine Learning dan mengubah data fundamental/harga langsung di level Database. Lakukan dengan penuh kehati-hatian.</span>
        </p>
      </header>

      <div className="bg-[#050505] border border-white/10 p-6 rounded-xl flex flex-wrap gap-4 items-end shadow-2xl">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tabel Target</label>
          <select 
            value={tableType} 
            onChange={(e) => setTableType(e.target.value as any)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 outline-none"
          >
            <option value="financial_reports">Fundamental (PER, PBV, ROE)</option>
            <option value="daily_market_prices">Market Prices (OHLCV)</option>
          </select>
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ticker</label>
          <input 
            type="text" placeholder="Cth: BBCA" 
            value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono uppercase focus:border-rose-500 outline-none"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tanggal Target</label>
          <input 
            type="date" 
            value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 outline-none"
          />
        </div>
        <button 
          onClick={handleSearch}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors h-[42px]"
        >
          <Search className="w-4 h-4" /> Tarik Data
        </button>
      </div>

      {status && <div className="text-xs text-amber-400 font-mono bg-amber-500/10 p-3 rounded-lg">{status}</div>}

      {record && (
        <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-[#0a0a0a] border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white">Inspeksi Data: {ticker}</h3>
            {isEditing && (
              <button onClick={handleSave} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Simpan Override
              </button>
            )}
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-3 text-xs text-gray-400 font-bold uppercase w-1/3">Parameter Metrik</th>
                  <th className="p-3 text-xs text-gray-400 font-bold uppercase w-2/3">Nilai Terekam (Klik ganda untuk edit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.keys(record).map(key => {
                  // Sembunyikan kolom sistem yang tidak boleh diedit
                  if (key === 'id' || key === 'created_at' || key === 'ticker' || key === 'period_date' || key === 'trade_date') return null;
                  
                  return (
                    <tr key={key} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-gray-400">{key}</td>
                      <td 
                        className="p-3 font-mono text-emerald-400 cursor-pointer"
                        onDoubleClick={() => setIsEditing(true)}
                      >
                        {isEditing ? (
                           <input 
                             type="number"
                             value={editForm[key] || ""}
                             onChange={(e) => setEditForm({...editForm, [key]: parseFloat(e.target.value)})}
                             className="bg-black border border-indigo-500 text-white px-2 py-1 rounded w-full outline-none"
                           />
                        ) : (
                           record[key] !== null ? record[key] : "NULL"
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}