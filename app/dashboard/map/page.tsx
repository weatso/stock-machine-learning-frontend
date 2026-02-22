"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Info } from "lucide-react";

export default function MarketMapPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-500" />
            Market Map
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Peta kekuatan pasar berdasarkan Sektor & Kapitalisasi.</p>
        </div>
      </div>

      {/* MOCKUP TREEMAP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
        {/* SEKTOR KEUANGAN (BESAR) */}
        <Card className="md:col-span-2 md:row-span-2 bg-green-900/20 border-green-500/30 flex flex-col items-center justify-center text-center p-6 hover:bg-green-900/30 transition-colors cursor-pointer group">
           <div className="text-2xl font-bold text-green-400">FINANCE</div>
           <div className="text-sm text-green-300/50 group-hover:text-green-300">+1.24%</div>
           <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-xs">
              <div className="bg-green-500/20 p-2 rounded text-xs text-green-300">BBCA +2.1%</div>
              <div className="bg-green-500/20 p-2 rounded text-xs text-green-300">BBRI +1.5%</div>
              <div className="bg-red-500/20 p-2 rounded text-xs text-red-300">BMRI -0.4%</div>
              <div className="bg-green-500/20 p-2 rounded text-xs text-green-300">BBNI +0.8%</div>
           </div>
        </Card>

        {/* SEKTOR INFRA (SEDANG) */}
        <Card className="bg-red-900/20 border-red-500/30 flex flex-col items-center justify-center p-4 hover:bg-red-900/30 transition-colors cursor-pointer">
           <div className="font-bold text-red-400">INFRASTRUCTURE</div>
           <div className="text-xs text-red-300/50">-0.85%</div>
           <div className="text-xs text-zinc-500 mt-2">TLKM, ISAT, EXCL</div>
        </Card>

        {/* SEKTOR ENERGY (SEDANG) */}
        <Card className="bg-green-900/20 border-green-500/30 flex flex-col items-center justify-center p-4 hover:bg-green-900/30 transition-colors cursor-pointer">
           <div className="font-bold text-green-400">ENERGY</div>
           <div className="text-xs text-green-300/50">+0.42%</div>
           <div className="text-xs text-zinc-500 mt-2">ADRO, PTBA, PGAS</div>
        </Card>

        {/* LAINNYA */}
        <Card className="md:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col items-center justify-center p-4">
           <div className="text-zinc-500 font-medium">CONSUMER & OTHERS</div>
           <div className="text-xs text-zinc-600">UNVR, ICBP, ASII, GOTO</div>
        </Card>
      </div>

      <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex gap-3 items-start">
         <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
         <div className="text-sm text-blue-200">
            <strong>Fitur Segera Hadir:</strong> Treemap interaktif yang terhubung langsung dengan data Realtime. Ukuran kotak akan menyesuaikan Market Cap, dan warna menyesuaikan perubahan harga harian.
         </div>
      </div>
    </div>
  );
}