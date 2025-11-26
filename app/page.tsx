// File: frontend/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import TradingViewWidget from "./components/TradingViewWidget";
import SearchBar from "./components/SearchBar";
import { FaUserCircle, FaBell } from 'react-icons/fa'; // Install react-icons jika belum

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || 'User');
      }
    };
    checkSession();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-full">
      
      {/* --- 1. TOP HEADER BAR (BARU) --- */}
      {/* Bar ini menempel di atas, memisahkan navigasi dan konten */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md sticky top-0 z-20">
        
        {/* Bagian Kiri: Judul Halaman */}
        <div>
          <h2 className="text-xl font-bold text-white">Market Overview</h2>
          <p className="text-xs text-gray-400">Data pasar terkini & analisis IHSG</p>
        </div>

        {/* Bagian Tengah/Kanan: Search Bar & Profil */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          
          {/* Search Bar (Lebih Lebar & Fokus) */}
          <div className="w-full md:w-96">
            <SearchBar />
          </div>

          {/* Ikon Profil & Notifikasi (Hiasan UI agar terlihat Pro) */}
          <div className="hidden md:flex items-center gap-4 text-gray-400 border-l border-gray-600 pl-6">
            <button className="hover:text-white transition">
              <FaBell className="text-xl" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right hidden lg:block">
                <p className="text-sm text-white font-medium">{userEmail}</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
              <FaUserCircle className="text-3xl text-gray-300" />
            </div>
          </div>

        </div>
      </header>

      {/* --- 2. KONTEN UTAMA (SCROLLABLE) --- */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* Welcome Banner (Opsional, bisa dihapus jika ingin lebih minimalis) */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Selamat Datang, <span className="text-blue-400">{userEmail.split('@')[0]}</span>
          </h1>
          <p className="text-gray-400">
            Berikut adalah pergerakan pasar hari ini. Gunakan pencarian di atas untuk analisis saham spesifik.
          </p>
        </div>

        {/* Chart Area */}
        <div className="h-[60vh] w-full rounded-xl shadow-2xl overflow-hidden border border-gray-700 bg-gray-900 relative z-0">
          <TradingViewWidget />
        </div>

        {/* Market Highlights / Widgets Lain */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contoh Widget Kosong 1 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Top Gainers</h3>
            <div className="h-20 bg-gray-700/30 rounded animate-pulse"></div>
          </div>
          
          {/* Contoh Widget Kosong 2 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Top Losers</h3>
            <div className="h-20 bg-gray-700/30 rounded animate-pulse"></div>
          </div>

          {/* Contoh Widget Kosong 3 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">News Flash</h3>
            <div className="h-20 bg-gray-700/30 rounded animate-pulse"></div>
          </div>
        </div>

      </div>
    </div>
  );
}