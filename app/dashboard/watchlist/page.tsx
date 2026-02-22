"use client";

import { Card } from "@/components/ui/card";
import { List, Star, Bell } from "lucide-react";

export default function WatchlistPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          Watchlist
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Saham dalam pantauan (Menunggu harga masuk).</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {/* ITEM 1 */}
         <Card className="bg-zinc-900 border-zinc-800 p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded bg-blue-900/20 flex items-center justify-center text-blue-500 font-bold">
                  TLKM
               </div>
               <div>
                  <div className="font-bold text-white">Telkom Indonesia</div>
                  <div className="text-xs text-zinc-500">Target Beli: <span className="text-green-400">Rp 2.800</span></div>
               </div>
            </div>
            <div className="text-right">
               <div className="text-lg font-mono text-zinc-200">2.950</div>
               <div className="text-xs text-amber-500 flex items-center justify-end gap-1">
                  <Bell className="w-3 h-3" /> Wait (-5%)
               </div>
            </div>
         </Card>

         {/* ITEM 2 */}
         <Card className="bg-zinc-900 border-zinc-800 p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded bg-yellow-900/20 flex items-center justify-center text-yellow-500 font-bold">
                  ICBP
               </div>
               <div>
                  <div className="font-bold text-white">Indofood CBP</div>
                  <div className="text-xs text-zinc-500">Target Beli: <span className="text-green-400">Rp 10.500</span></div>
               </div>
            </div>
            <div className="text-right">
               <div className="text-lg font-mono text-zinc-200">11.200</div>
               <div className="text-xs text-zinc-500 flex items-center justify-end gap-1">
                  Wait (-7%)
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}