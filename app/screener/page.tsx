// File: frontend/app/screener/page.tsx

'use client'; 

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa'; // Pastikan Anda sudah install: npm install react-icons

// Tipe data untuk Saham
interface StockData {
  ticker: string;
  company_name: string;
  market_cap: number;
  fundamental_per: number | null;
  fundamental_pbv: number | null;
  fundamental_ps: number | null;
  sector_name: string;
}
// Tipe data untuk Sektor
interface Sector {
  id: number;
  name: string;
}
// Tipe data untuk Sorting
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
// Tipe data untuk Market Cap
type CapType = 'big' | 'medium' | 'small' | null;


export default function ScreenerPage() {
  // --- STATE MANAGEMENT ---
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [capFilter, setCapFilter] = useState<CapType>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sectors, setSectors] = useState<Sector[]>([]);
  
  // ... state lainnya ...
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'market_cap', direction: 'desc' });
  
  // --- TAMBAHKAN INI ---
  const [limit, setLimit] = useState<number>(100); // State untuk jumlah tampil, default 100

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // --- DATA FETCHING ---

  // 1. Ambil daftar sektor (VERSI AMAN)
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/sectors`);
        
        // Cek apakah data yang diterima BENAR-BENAR sebuah Array
        if (Array.isArray(response.data)) {
            setSectors(response.data);
        } else {
            console.warn("API Sektor mengembalikan bukan array:", response.data);
            setSectors([]); // Set array kosong jika data salah
        }
      } catch (err) {
        console.error("Gagal mengambil daftar sektor:", err);
        setSectors([]); // Set array kosong jika error
      }
    };
    fetchSectors();
  }, [apiUrl]);

  // 2. Fungsi utama untuk mengambil data saham (VERSI AMAN)
  const fetchStockData = async (
    currentSortConfig = sortConfig, 
    currentSearch = searchTerm, 
    currentCap = capFilter, 
    currentSector = sectorFilter,
    currentLimit = limit
  ) => {
    setLoading(true);
    try {
      const params: any = {
        search: currentSearch || null,
        cap_type: currentCap,
        sector_id: currentSector === 'all' ? null : parseInt(currentSector),
        sort_by: currentSortConfig.key,
        sort_order: currentSortConfig.direction,
        limit: currentLimit
      };

      const response = await axios.get(`${apiUrl}/api/dashboard/all-stocks`, { params });
      
      // --- INI PERBAIKANNYA ---
      // Cek apakah data yang diterima BENAR-BENAR Array sebelum di-set
      if (Array.isArray(response.data)) {
        setStocks(response.data);
      } else {
        console.error("API Screener mengembalikan format salah (bukan array):", response.data);
        setStocks([]); // Paksa jadi array kosong agar tidak crash
      }
      // --- AKHIR PERBAIKAN ---

    } catch (err) {
      console.error("Gagal mengambil data screener:", err);
      setStocks([]); // Pastikan kosong jika error jaringan
    }
    setLoading(false);
  };

  // 3. Ambil data awal saat load
  useEffect(() => {
    fetchStockData(sortConfig, searchTerm, capFilter, sectorFilter, limit);
  }, [apiUrl]);

  // --- EVENT HANDLERS (VERSI SUDAH DIPERBAIKI) ---

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStockData(sortConfig, searchTerm, capFilter, sectorFilter, limit);
  };
  
  const handleCapFilter = (cap: CapType) => {
    const newCap = capFilter === cap ? null : cap;
    setCapFilter(newCap);
    fetchStockData(sortConfig, searchTerm, newCap, sectorFilter, limit);
  };
  
  const handleSectorFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSector = e.target.value;
    setSectorFilter(newSector);
    fetchStockData(sortConfig, searchTerm, capFilter, newSector, limit);
  };
  
  const handleSort = (key: string) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      newDirection = 'desc';
    }
    
    const newSortConfig = { key, direction: newDirection };
    setSortConfig(newSortConfig);
    fetchStockData(newSortConfig, searchTerm, capFilter, sectorFilter, limit);
  }; // <-- Perhatikan: handleSort SELESAI DI SINI.

  // 5. Handler BARU (sekarang berada di luar/setelah handleSort)
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    // Langsung ambil data baru dengan limit baru
    fetchStockData(sortConfig, searchTerm, capFilter, sectorFilter, newLimit);
  };

  // --- Fungsi Helper (formatNumber, dll) dimulai di sini ---
  
  // --- FUNGSI HELPER (INI YANG DIPERBAIKI) ---
  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    if (num > 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + ' T';
    if (num > 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + ' M';
    return num.toLocaleString('id-ID');
  };
  
  const formatRatio = (num: number | null) => {
    if (num === null || num === undefined) return 'N/M';
    return num.toFixed(2);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <FaSort className="inline ml-1 opacity-30" />;
    }
    if (sortConfig.direction === 'asc') {
      return <FaSortUp className="inline ml-1 text-blue-400" />;
    }
    return <FaSortDown className="inline ml-1 text-blue-400" />;
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Stock Screener</h1>
      
      {/* --- Bagian Filter (Form) --- */}
      <form onSubmit={handleSearch} className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            placeholder="Cari Ticker atau Nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
          >
            Cari
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <span className="text-gray-400 text-sm">Market Cap:</span>
          <button type="button" onClick={() => handleCapFilter('big')} className={`px-3 py-1 rounded-full text-sm ${capFilter === 'big' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            Big Cap
          </button>
          <button type="button" onClick={() => handleCapFilter('medium')} className={`px-3 py-1 rounded-full text-sm ${capFilter === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            Medium Cap
          </button>
          <button type="button" onClick={() => handleCapFilter('small')} className={`px-3 py-1 rounded-full text-sm ${capFilter === 'small' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            Small Cap
          </button>
          
          <select 
            value={sectorFilter}
            onChange={handleSectorFilter}
            className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
          >
            <option value="all">Semua Sektor</option>
            
            {/* Tambahkan pengecekan 'Array.isArray(sectors) &&' */}
            {Array.isArray(sectors) && sectors.map(sector => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>
        </div>
      </form>

      {/* --- Bagian Tabel Daftar Saham (DENGAN SCROLL & STICKY HEADER) --- */}
      <div className="w-full rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        {/* 1. Kita buat DIV BARU di dalam sini untuk wadah scroll */}
        {/* max-h-[65vh] = tinggi maksimum 65% dari layar Anda. */}
        {/* Anda bisa ubah angka '65' ini (misal 50vh, 70vh) sesuai selera. */}
        <div className="overflow-y-auto max-h-[65vh]">
          
          <table className="min-w-full divide-y divide-gray-700">
            
            {/* 2. Kita tambahkan 'sticky top-0' di <thead> */}
            {/* Ini membuatnya "lengket" di bagian atas saat scroll */}
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr className="text-left text-xs font-medium uppercase tracking-wider">
                <th onClick={() => handleSort('ticker')} className="cursor-pointer px-4 py-3">Ticker {getSortIcon('ticker')}</th>
                <th onClick={() => handleSort('company_name')} className="cursor-pointer px-4 py-3">Company Name {getSortIcon('company_name')}</th>
                <th onClick={() => handleSort('market_cap')} className="cursor-pointer px-4 py-3">Market Cap {getSortIcon('market_cap')}</th>
                <th className="px-4 py-3">Sector</th>
                <th onClick={() => handleSort('fundamental_per')} className="cursor-pointer px-4 py-3">PER {getSortIcon('fundamental_per')}</th>
                <th onClick={() => handleSort('fundamental_pbv')} className="cursor-pointer px-4 py-3">PBV {getSortIcon('fundamental_pbv')}</th>
                <th onClick={() => handleSort('fundamental_ps')} className="cursor-pointer px-4 py-3">PS {getSortIcon('fundamental_ps')}</th>
              </tr>
            </thead>
            
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Memuat data...</td></tr>
              ) : stocks.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-8">Tidak ada data yang ditemukan.</td></tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.ticker} className="hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap font-mono font-bold">
                      <Link href={`/stock/${stock.ticker}`} className="text-blue-400 hover:text-blue-300">
                        {stock.ticker}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap max-w-xs truncate" title={stock.company_name}>
                      {stock.company_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono">{formatNumber(stock.market_cap)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{stock.sector_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono">{formatRatio(stock.fundamental_per)}</td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono">{formatRatio(stock.fundamental_pbv)}</td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono">{formatRatio(stock.fundamental_ps)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
        </div> {/* <-- Penutup div scroll */}
      </div> {/* <-- Penutup div luar */}

      {/* --- TAMBAHKAN UI INI DI BAWAH TABEL --- */}
      <div className="flex justify-end items-center mt-4">
        <span className="text-sm text-gray-400 mr-3">Tampilkan:</span>
        <select 
          value={limit}
          onChange={handleLimitChange}
          className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="25">25 Saham</option>
          <option value="50">50 Saham</option>
          <option value="100">100 Saham</option>
          <option value="250">250 Saham</option>
        </select>
      </div>
      
    </div>
  );
}