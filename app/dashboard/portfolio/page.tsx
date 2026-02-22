"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Wallet, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-500" />
            My Portfolio
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola aset dan pantau performa investasi Anda.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Input Transaksi
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
               <div className="text-zinc-500 text-xs uppercase font-medium">Total Equity</div>
               <div className="text-2xl font-bold text-white mt-2">Rp 145.250.000</div>
               <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> +12.5% (All Time)
               </div>
            </CardContent>
         </Card>
         <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
               <div className="text-zinc-500 text-xs uppercase font-medium">Buying Power (Cash)</div>
               <div className="text-2xl font-bold text-zinc-300 mt-2">Rp 25.500.000</div>
            </CardContent>
         </Card>
         <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
               <div className="text-zinc-500 text-xs uppercase font-medium">Est. Dividend (Yearly)</div>
               <div className="text-2xl font-bold text-blue-400 mt-2">Rp 4.200.000</div>
            </CardContent>
         </Card>
      </div>

      {/* TABLE HOLDINGS */}
      <Card className="bg-zinc-900 border-zinc-800">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                  <tr>
                     <th className="px-6 py-4">Emiten</th>
                     <th className="px-6 py-4 text-right">Avg Price</th>
                     <th className="px-6 py-4 text-right">Last Price</th>
                     <th className="px-6 py-4 text-right">Lots</th>
                     <th className="px-6 py-4 text-right">Value</th>
                     <th className="px-6 py-4 text-right">Gain/Loss</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800">
                  {/* DUMMY DATA 1 */}
                  <tr className="hover:bg-zinc-800/50 transition-colors">
                     <td className="px-6 py-4 font-bold text-white">BBCA</td>
                     <td className="px-6 py-4 text-right text-zinc-400">9.200</td>
                     <td className="px-6 py-4 text-right text-white">10.150</td>
                     <td className="px-6 py-4 text-right text-zinc-400">50</td>
                     <td className="px-6 py-4 text-right text-white">50.750.000</td>
                     <td className="px-6 py-4 text-right text-green-400 font-bold">+10.3%</td>
                  </tr>
                  {/* DUMMY DATA 2 */}
                  <tr className="hover:bg-zinc-800/50 transition-colors">
                     <td className="px-6 py-4 font-bold text-white">ITMG</td>
                     <td className="px-6 py-4 text-right text-zinc-400">26.500</td>
                     <td className="px-6 py-4 text-right text-white">25.800</td>
                     <td className="px-6 py-4 text-right text-zinc-400">20</td>
                     <td className="px-6 py-4 text-right text-white">51.600.000</td>
                     <td className="px-6 py-4 text-right text-red-400 font-bold">-2.6%</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}