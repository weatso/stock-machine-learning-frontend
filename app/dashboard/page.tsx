"use client";

import { useEffect, useRef, useState } from "react";
import { 
  TrendingUp, TrendingDown, Zap, 
  Activity, ArrowRight, BrainCircuit 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipe Data
interface WidgetData {
  radar: any[];
  gainers: any[];
  losers: any[];
  insight: {
    text: string;
    sentiment: string;
    undervalued_count: number;
  };
}

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data Widget dari Backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://127.0.0.1:8000/stats/dashboard-widgets");
        if (!res.ok) throw new Error("Gagal load widget");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Gagal load widget", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Script TradingView (Versi DARK MODE)
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "IDX:COMPOSITE",
        "interval": "D",
        "timezone": "Asia/Jakarta",
        "theme": "dark", 
        "style": "1",
        "locale": "id",
        "enable_publishing": false,
        "backgroundColor": "rgba(0, 0, 0, 1)",
        "gridColor": "rgba(42, 46, 57, 0.3)",
        "hide_top_toolbar": false,
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
  }, []);

  // Helper Format Uang (Safety Check)
  const fmt = (n: any) => new Intl.NumberFormat('id-ID').format(n || 0);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100">
      
      {/* SECTION 1: HEADER & AI INSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            Market Overview
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Pantauan Realtime Bursa Efek Indonesia (IHSG).
          </p>
        </div>

        {/* AI INSIGHT CARD */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1 border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex gap-4 items-start">
            <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-200 mb-1">Weatso AI Insight</h3>
              {loading ? (
                <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded"></div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {data?.insight?.text || "Analisis pasar sedang dimuat..."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: CHART BESAR */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden shadow-lg shadow-black/50">
        <CardContent className="p-0">
          <div className="h-[450px] w-full" ref={container} />
        </CardContent>
      </Card>

      {/* SECTION 3: WIDGETS (GRAHAM RADAR & MOVERS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WIDGET KIRI: GRAHAM RADAR */}
        <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
          <CardHeader className="pb-3 border-b border-zinc-800/50">
            <CardTitle className="text-base flex justify-between items-center text-zinc-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Graham Radar
              </div>
              <span className="text-[10px] font-normal text-zinc-500 uppercase tracking-wider">
                Top Undervalued
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse"/>)}
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {/* SAFE MAPPING: Cek data?.radar ada isinya gak */}
                {data?.radar && data.radar.length > 0 ? (
                    data.radar.map((stock: any) => (
                      <div key={stock.ticker} className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                           onClick={() => window.location.href = `/dashboard/stocks/${stock.ticker}`}>
                        <div>
                          <div className="font-bold text-sm text-white">{stock.ticker}</div>
                          <div className="text-xs text-zinc-500 truncate max-w-[120px]">{stock.company_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-mono text-sm font-bold">
                            {/* PERBAIKAN: Tambahkan ( ... || 0 ) agar tidak null */}
                            MOS {(stock.margin_of_safety || 0).toFixed(0)}%
                          </div>
                          <div className="text-xs text-zinc-500">
                            Rp {fmt(stock.last_price)}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-zinc-500 text-xs">
                        Belum ada data radar yang tersedia.
                    </div>
                )}
              </div>
            )}
            <div className="p-3 border-t border-zinc-800/50 text-center">
              <a href="/dashboard/stocks" className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* WIDGET KANAN: MOVERS (TABS) */}
        <Card className="bg-zinc-900 border-zinc-800 h-full">
          <CardHeader className="pb-0 pt-4 px-4 border-b-0">
            <Tabs defaultValue="gainers" className="w-full">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-base text-zinc-100">Market Movers</CardTitle>
                <TabsList className="bg-zinc-950 border border-zinc-800 h-8">
                  <TabsTrigger value="gainers" className="text-xs h-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-green-400">Gainers</TabsTrigger>
                  <TabsTrigger value="losers" className="text-xs h-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-red-400">Losers</TabsTrigger>
                </TabsList>
              </div>

              {/* TAB CONTENT: GAINERS */}
              <TabsContent value="gainers" className="mt-0">
                <div className="divide-y divide-zinc-800/50 border-t border-zinc-800/50">
                  {loading ? <div className="p-4 text-zinc-500 text-xs">Loading...</div> : 
                   data?.gainers && data.gainers.length > 0 ? (
                       data.gainers.map((stock: any) => (
                        <div key={stock.ticker} className="flex items-center justify-between p-3.5 hover:bg-zinc-800/30">
                          <div className="font-bold text-sm text-white">{stock.ticker}</div>
                          <div className="flex items-center gap-3">
                             <span className="text-xs text-zinc-400">Rp {fmt(stock.last_price)}</span>
                             <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                               {/* PERBAIKAN: Safety check agar tidak crash */}
                               +{(stock.change_pct || 0).toFixed(2)}%
                             </span>
                          </div>
                        </div>
                      ))
                   ) : (
                       <div className="p-4 text-center text-zinc-500 text-xs">Data tidak tersedia.</div>
                   )}
                </div>
              </TabsContent>

              {/* TAB CONTENT: LOSERS */}
              <TabsContent value="losers" className="mt-0">
                <div className="divide-y divide-zinc-800/50 border-t border-zinc-800/50">
                  {loading ? <div className="p-4 text-zinc-500 text-xs">Loading...</div> : 
                   data?.losers && data.losers.length > 0 ? (
                       data.losers.map((stock: any) => (
                        <div key={stock.ticker} className="flex items-center justify-between p-3.5 hover:bg-zinc-800/30">
                          <div className="font-bold text-sm text-white">{stock.ticker}</div>
                          <div className="flex items-center gap-3">
                             <span className="text-xs text-zinc-400">Rp {fmt(stock.last_price)}</span>
                             <span className="text-xs font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                               {/* PERBAIKAN: Safety check */}
                               {(stock.change_pct || 0).toFixed(2)}%
                             </span>
                          </div>
                        </div>
                      ))
                   ) : (
                       <div className="p-4 text-center text-zinc-500 text-xs">Data tidak tersedia.</div>
                   )}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}