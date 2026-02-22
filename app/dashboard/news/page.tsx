"use client";

import { Card } from "@/components/ui/card";
import { Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-orange-500" />
          News & Sentiment
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Berita pasar terkini dengan analisis sentimen AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* BERITA 1 */}
         <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer hover:border-zinc-700 transition-all">
            <div className="h-40 bg-zinc-800 relative">
               {/* Placeholder Image */}
               <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-bold text-2xl">IMG</div>
               <div className="absolute top-2 right-2 bg-green-500/90 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> BULLISH
               </div>
            </div>
            <div className="p-4">
               <div className="text-xs text-zinc-500 mb-2">Kontan • 2 Jam lalu</div>
               <h3 className="font-bold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">
                  Laba Bersih BBCA Tumbuh 15% di Kuartal I-2026, Lampaui Ekspektasi Analis
               </h3>
               <p className="text-xs text-zinc-400 line-clamp-3">
                  PT Bank Central Asia Tbk (BBCA) kembali mencatatkan kinerja gemilang dengan pertumbuhan kredit yang solid dan efisiensi operasional yang terjaga...
               </p>
            </div>
         </Card>

         {/* BERITA 2 */}
         <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer hover:border-zinc-700 transition-all">
            <div className="h-40 bg-zinc-800 relative">
               <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-bold text-2xl">IMG</div>
               <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> BEARISH
               </div>
            </div>
            <div className="p-4">
               <div className="text-xs text-zinc-500 mb-2">CNBC Indonesia • 4 Jam lalu</div>
               <h3 className="font-bold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">
                  Harga Batubara Acuan Terkoreksi, Sektor Energi Tertekan
               </h3>
               <p className="text-xs text-zinc-400 line-clamp-3">
                  Pelemahan permintaan dari China membuat harga batubara global turun ke level terendah dalam 6 bulan terakhir. Emiten pertambangan mulai waspada...
               </p>
            </div>
         </Card>

         {/* BERITA 3 */}
         <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group cursor-pointer hover:border-zinc-700 transition-all">
            <div className="h-40 bg-zinc-800 relative">
               <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-bold text-2xl">IMG</div>
               <div className="absolute top-2 right-2 bg-zinc-500/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <Minus className="w-3 h-3" /> NEUTRAL
               </div>
            </div>
            <div className="p-4">
               <div className="text-xs text-zinc-500 mb-2">Bisnis.com • 5 Jam lalu</div>
               <h3 className="font-bold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">
                  IHSG Diprediksi Sideways Menunggu Keputusan The Fed
               </h3>
               <p className="text-xs text-zinc-400 line-clamp-3">
                  Para investor cenderung wait and see menjelang rapat FOMC minggu depan. Volume perdagangan di bursa terpantau tipis...
               </p>
            </div>
         </Card>

      </div>
    </div>
  );
}