<<<<<<< HEAD
'use client';

import { ReactLenis } from '@studio-freight/react-lenis';
import CrystalBackground from '@/components/3d/CrystalBackground';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; 
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <ReactLenis root>
      <main className="relative w-full min-h-screen font-sans selection:bg-zinc-700 selection:text-white">
        
        {/* BACKGROUND 3D (Fixed di belakang) */}
        <CrystalBackground />

        {/* HERO SECTION */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-10 max-w-4xl space-y-8"
          >

            {/* Headline Raksasa */}
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
              The Truth About <br /> Your Stocks.
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Analisis fundamental tanpa bias. Temukan <em>Margin of Safety</em> yang sebenarnya dengan 
              data real-time dan algoritma valuasi presisi tinggi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg h-12 px-8 rounded-full" asChild>
                <Link href="/dashboard">
                  Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white text-lg h-12 px-8 rounded-full bg-black/40 backdrop-blur-sm">
                Read Documentation
              </Button>
            </div>
          </motion.div>
        </section>

        {/* FEATURES GRID (Bento Style) */}
        <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent to-zinc-950/80 backdrop-blur-[2px]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BarChart3 />}
              title="Valuation Engine"
              desc="Menghitung Fair Value otomatis berdasarkan EPS, BVPS, dan pertumbuhan historis."
            />
            <FeatureCard 
              icon={<ShieldCheck />}
              title="Risk Assessment"
              desc="Mendeteksi anomali laporan keuangan sebelum Anda membeli saham gorengan."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Real-time Screener"
              desc="Filter 800+ saham IDX dalam milidetik menggunakan teknologi Supabase & GoAPI."
            />
          </div>
        </section>

        {/* DOCUMENTATION (Lorem Ipsum Area) */}
        <section className="relative z-10 py-32 px-6 bg-zinc-950 text-zinc-300">
          <div className="max-w-3xl mx-auto space-y-12">
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white tracking-tight">Methodology</h2>
              <div className="h-1 w-20 bg-zinc-800 rounded-full"></div>
            </div>

            <article className="prose prose-invert prose-zinc prose-lg">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <h3>The Graham Formula</h3>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
              </p>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl my-8">
                <code className="text-green-400">V = EPS x (8.5 + 2g)</code>
              </div>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos 
                qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
              </p>
            </article>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 py-12 border-t border-zinc-900 bg-zinc-950 text-center text-zinc-600 text-sm">
          <p>© 2026 DSS Investasi. Built for rational investors.</p>
        </footer>

      </main>
    </ReactLenis>
  );
}

// Komponen Kecil untuk Card
function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/60 backdrop-blur-sm">
      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
=======
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
>>>>>>> 183c7252260620d31c26a1742fb1457d9f12cc04
}