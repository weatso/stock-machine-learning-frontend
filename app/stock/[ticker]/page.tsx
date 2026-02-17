// File: frontend/app/stock/[ticker]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import StockDetailChart from '../../components/StockDetailChart';

// --- 1. UPDATE INTERFACE DI SINI ---
// Kita tambahkan summary, website, dan logo_url
interface StockProfile {
  ticker: string;
  company_name: string;
  sector_name: string;
  market_cap: number;
  fundamental_per: number | null;
  fundamental_pbv: number | null;
  fundamental_ps: number | null;
  // Tambahan baru:
  summary: string | null;
  website: string | null;
}

export default function StockDetailPage() {
  const params = useParams();
  const ticker = typeof params.ticker === 'string' ? decodeURIComponent(params.ticker).toUpperCase() : '';
  
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!ticker) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/stock/profile/${ticker}`);
        if (res.data.error) {
          setProfile(null);
        } else {
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Gagal ambil profil:", err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [ticker, apiUrl]);

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    if (num > 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + ' T';
    if (num > 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + ' M';
    return num.toLocaleString('id-ID');
  };

  const formatRatio = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toFixed(2) + 'x';
  };

  if (!ticker) return <div className="p-12 text-white">Memuat Ticker...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* --- 1. HEADER UTAMA (JUDUL) --- */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-10 bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          </div>
        ) : profile ? (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  {profile.ticker}
                  <span className="text-sm font-normal bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                    {profile.sector_name}
                  </span>
                </h1>
                <p className="text-gray-400 text-lg mt-1">{profile.company_name}</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-gray-400 text-sm uppercase">Market Cap</p>
                <p className="text-2xl font-mono font-bold text-green-400">
                  Rp {formatNumber(profile.market_cap)}
                </p>
              </div>
            </div>

            {/* --- 2. UPDATE TAMPILAN DI SINI (DESKRIPSI & WEB) --- */}
            {/* Kita taruh di dalam kotak Header yang sama, tapi di bagian bawah */}
            <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Tentang Perusahaan</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                  {profile.summary ? profile.summary : "Deskripsi perusahaan belum tersedia."}
                </p>
                {profile.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Kunjungi Website Resmi &rarr;
                  </a>
                )}
            </div>
            {/* --- AKHIR UPDATE TAMPILAN --- */}

          </div>
        ) : (
          <div className="text-white">
            <h1 className="text-4xl font-bold">{ticker}</h1>
            <p className="text-red-400 mt-2">Data fundamental belum tersedia di database.</p>
          </div>
        )}
      </div>

      {/* --- 3. DATA FUNDAMENTAL (GRID) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* PER */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md hover:border-blue-500 transition">
          <p className="text-gray-400 text-sm uppercase mb-1">P/E Ratio (PER)</p>
          <p className={`text-3xl font-bold ${profile?.fundamental_per && profile.fundamental_per < 0 ? 'text-red-400' : 'text-white'}`}>
            {profile ? formatRatio(profile.fundamental_per) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-2">Harga dibandingkan Laba</p>
        </div>

        {/* PBV */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md hover:border-blue-500 transition">
          <p className="text-gray-400 text-sm uppercase mb-1">Price to Book (PBV)</p>
          <p className="text-3xl font-bold text-white">
            {profile ? formatRatio(profile.fundamental_pbv) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-2">Harga dibandingkan Modal</p>
        </div>

        {/* PS */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md hover:border-blue-500 transition">
          <p className="text-gray-400 text-sm uppercase mb-1">Price to Sales (P/S)</p>
          <p className="text-3xl font-bold text-white">
            {profile ? formatRatio(profile.fundamental_ps) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-2">Harga dibandingkan Omzet</p>
        </div>
      </div>

      {/* --- 4. CHART AREA --- */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Analisis Teknikal</h2>
        </div>
        <div className="h-[600px] w-full">
          {ticker && <StockDetailChart ticker={ticker} />}
        </div>
      </div>
    </div>
  );
}