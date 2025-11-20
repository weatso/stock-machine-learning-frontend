// File: frontend/app/admin/editor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../../../lib/supabaseClient'; // Sesuaikan path import
import { useRouter } from 'next/navigation';
import { FaSave, FaSearch } from 'react-icons/fa';

interface StockEditData {
  ticker: string;
  company_name: string;
  market_cap: number | string; // String agar bisa diedit di input
  fundamental_per: number | string;
  fundamental_pbv: number | string;
  fundamental_ps: number | string;
}

export default function AdminEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState<StockEditData[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null); // Ticker yang sedang disimpan

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. CEK KEAMANAN (Hanya Admin Boleh Masuk)
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert("AKSES DITOLAK: Halaman ini khusus Admin.");
        router.push('/'); // Tendang user biasa ke dashboard
      } else {
        fetchData(); // Jika admin, ambil data
      }
    };
    checkAdmin();
  }, []);

  // 2. Ambil Data (Menggunakan API Screener yang sudah ada untuk daftar)
  const fetchData = async (query = '') => {
    setLoading(true);
    try {
      // Kita gunakan limit besar agar admin enak editnya
      const res = await axios.get(`${apiUrl}/api/dashboard/all-stocks`, {
        params: { search: query, limit: 50 } 
      });
      
      // Konversi null ke string kosong '' agar input form tidak error
      const cleanData = res.data.map((s: any) => ({
        ...s,
        market_cap: s.market_cap ?? '',
        fundamental_per: s.fundamental_per ?? '',
        fundamental_pbv: s.fundamental_pbv ?? '',
        fundamental_ps: s.fundamental_ps ?? ''
      }));
      setStocks(cleanData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // 3. Handle Perubahan Input (Ketik)
  const handleChange = (index: number, field: keyof StockEditData, value: string) => {
    const newStocks = [...stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    setStocks(newStocks);
  };

  // 4. Handle Simpan (Per Baris)
  const handleSave = async (stock: StockEditData) => {
    setSaving(stock.ticker);
    try {
      // Kirim data ke API Update yang baru kita buat
      // Konversi string kosong kembali ke null atau angka
      const payload = {
        market_cap: stock.market_cap === '' ? null : Number(stock.market_cap),
        fundamental_per: stock.fundamental_per === '' ? null : Number(stock.fundamental_per),
        fundamental_pbv: stock.fundamental_pbv === '' ? null : Number(stock.fundamental_pbv),
        fundamental_ps: stock.fundamental_ps === '' ? null : Number(stock.fundamental_ps),
      };

      await axios.put(`${apiUrl}/api/stock/${stock.ticker}`, payload);
      alert(`Data ${stock.ticker} berhasil disimpan!`);
    } catch (err) {
      alert(`Gagal menyimpan ${stock.ticker}`);
      console.error(err);
    }
    setSaving(null);
  };

  // 5. Handle Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(search);
  };

  if (loading && stocks.length === 0) return <div className="p-8 text-white">Memeriksa akses & memuat data...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-400">Admin Data Editor</h1>
        <div className="text-sm text-gray-400">Edit data fundamental secara manual</div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
        <input 
          type="text" placeholder="Cari Ticker (cth: BREN, AADI)..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-grow p-3 bg-gray-800 rounded border border-gray-600 focus:border-red-500 outline-none"
        />
        <button type="submit" className="px-6 bg-red-600 hover:bg-red-700 rounded font-bold flex items-center gap-2">
          <FaSearch /> Cari
        </button>
      </form>

      {/* Tabel Editor */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow border border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4 border-b border-gray-700">Ticker</th>
              <th className="p-4 border-b border-gray-700">Market Cap (IDR)</th>
              <th className="p-4 border-b border-gray-700">PER (x)</th>
              <th className="p-4 border-b border-gray-700">PBV (x)</th>
              <th className="p-4 border-b border-gray-700">PS (x)</th>
              <th className="p-4 border-b border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-700">
            {stocks.map((stock, index) => (
              <tr key={stock.ticker} className="hover:bg-gray-750">
                <td className="p-4 font-bold text-red-300">{stock.ticker}</td>
                
                {/* Input Market Cap */}
                <td className="p-2">
                  <input 
                    type="number" 
                    value={stock.market_cap} 
                    onChange={(e) => handleChange(index, 'market_cap', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-red-500 outline-none"
                    placeholder="NULL"
                  />
                </td>

                {/* Input PER */}
                <td className="p-2">
                  <input 
                    type="number" step="0.01"
                    value={stock.fundamental_per} 
                    onChange={(e) => handleChange(index, 'fundamental_per', e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-600 rounded p-2 focus:border-red-500 outline-none"
                    placeholder="NULL"
                  />
                </td>

                {/* Input PBV */}
                <td className="p-2">
                  <input 
                    type="number" step="0.01"
                    value={stock.fundamental_pbv} 
                    onChange={(e) => handleChange(index, 'fundamental_pbv', e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-600 rounded p-2 focus:border-red-500 outline-none"
                    placeholder="NULL"
                  />
                </td>

                {/* Input PS */}
                <td className="p-2">
                  <input 
                    type="number" step="0.01"
                    value={stock.fundamental_ps} 
                    onChange={(e) => handleChange(index, 'fundamental_ps', e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-600 rounded p-2 focus:border-red-500 outline-none"
                    placeholder="NULL"
                  />
                </td>

                {/* Tombol Save */}
                <td className="p-2 text-center">
                  <button 
                    onClick={() => handleSave(stock)}
                    disabled={saving === stock.ticker}
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white disabled:opacity-50 transition"
                    title="Simpan Perubahan"
                  >
                    {saving === stock.ticker ? '...' : <FaSave />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {stocks.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">Tidak ada data ditemukan. Coba cari ticker lain.</div>
        )}
      </div>
    </div>
  );
}