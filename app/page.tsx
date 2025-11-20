// File: frontend/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import TradingViewWidget from "./components/TradingViewWidget";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Cek apakah ada user yang sedang login
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Jika tidak ada, lempar ke halaman Login
        router.push('/login');
      } else {
        // Jika ada, bolehkan masuk
        setIsAuthenticated(true);
      }
    };

    checkSession();
  }, [router]);

  // Tampilkan loading kosong sementara pengecekan berlangsung
  if (!isAuthenticated) {
    return null; // Atau return <div className="...loading...">Loading...</div>
  }

  // --- KONTEN DASHBOARD ---
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Selamat Datang di Dashboard
      </h1>
      
      <p className="mb-6 text-gray-300">
        Menampilkan chart Indeks Harga Saham Gabungan (IHSG/Composite).
      </p>

      <div className="h-[50vh] w-full rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <TradingViewWidget />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Market Highlights</h2>
        <div className="p-12 bg-gray-800 rounded-lg text-center border border-gray-700">
          <p className="text-gray-400">
            (Area untuk komponen highlight dan lainnya akan ada di sini)
          </p>
        </div>
      </div>
    </div>
  );
}