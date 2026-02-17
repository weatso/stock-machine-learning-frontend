'use client';

import CrystalBackground from '@/components/3d/CrystalBackground';
import { Button } from '@/components/ui/button';
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion } from 'framer-motion';
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
}