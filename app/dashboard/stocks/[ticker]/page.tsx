"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, 
  Activity, AlertTriangle, Building2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

// --- KOMPONEN CHART (FIXED TYPE ERROR) ---
const StockChart = ({ ticker }: { ticker: string }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchChart = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/stocks/${ticker}/chart?timeframe=1y`);
                if(!res.ok) throw new Error("Gagal load chart");
                const json = await res.json();
                
                if (Array.isArray(json)) {
                    setData(json);
                } else {
                    console.error("Format data chart salah:", json);
                    setError(true);
                }
            } catch (e) { 
                console.error(e); 
                setError(true);
            } finally { 
                setLoading(false); 
            }
        };
        fetchChart();
    }, [ticker]);

    if(loading) return <div className="h-[350px] w-full bg-zinc-900 animate-pulse rounded-xl" />;
    
    if(error || !data || data.length === 0) return (
        <div className="h-[350px] w-full bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-800">
            Grafik tidak tersedia.
        </div>
    );

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                        dataKey="time" 
                        stroke="#71717a" 
                        tick={{fontSize: 10}} 
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return `${date.getDate()}/${date.getMonth()+1}`;
                        }}
                    />
                    <YAxis 
                        domain={['auto', 'auto']} 
                        stroke="#71717a" 
                        tick={{fontSize: 10}}
                        tickFormatter={(val) => new Intl.NumberFormat('id-ID', { notation: "compact" }).format(val)} 
                    />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff'}}
                        // --- FIX TYPE ERROR DI SINI ---
                        formatter={(val: any) => {
                            // Pastikan val adalah angka sebelum diformat
                            const num = Number(val);
                            return [`Rp ${new Intl.NumberFormat('id-ID').format(num)}`, 'Harga'];
                        }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', {dateStyle: 'full'})}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// --- BAGIAN BAWAH TETAP SAMA (StockDetailPage) ---
// (Copy paste sisa kode StockDetailPage Anda di bawah sini, 
//  atau biarkan kode lama di bawah komponen StockChart ini)

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const router = useRouter();
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/stocks/${ticker}`);
        if (!res.ok) throw new Error("Saham tidak ditemukan");
        const json = await res.json();
        setStock(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [ticker]);

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n || 0);
  const fmtCur = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return <div className="min-h-screen bg-black text-zinc-500 p-10 flex items-center justify-center">Memuat Data...</div>;
  if (!stock) return <div className="min-h-screen bg-black text-red-500 p-10">Data tidak ditemukan.</div>;

  const isUndervalued = stock.margin_of_safety > 0;
  const mosColor = isUndervalued ? "text-green-400" : "text-red-400";
  const mosBg = isUndervalued ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 space-y-6">
      
      {/* 1. NAVIGASI */}
      <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white pl-0 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke List
      </Button>

      {/* 2. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
           {/* LOGO */}
           <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-zinc-700 shadow-lg shadow-blue-900/10 relative">
              <img 
                 src={stock.logo_url} 
                 alt={stock.ticker} 
                 className="w-full h-full object-contain p-2"
                 onError={(e) => {
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    target.style.display = 'none';
                    if(parent) {
                        parent.innerText = stock.ticker[0];
                        parent.className = "w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 border border-zinc-700 shadow-lg shrink-0";
                    }
                 }}
              />
           </div>
           <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">{stock.ticker}</h1>
              <p className="text-zinc-400 text-lg">{stock.company_name}</p>
              <div className="flex gap-2 mt-2">
                 <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">{stock.sector}</span>
                 <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">IPO: {stock.listing_date || "-"}</span>
              </div>
           </div>
        </div>

        <div className="text-right">
           <div className="text-4xl font-mono font-bold text-white">{fmtCur(stock.last_price)}</div>
           <div className={`flex items-center justify-end gap-1 mt-1 font-medium ${stock.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.change_pct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stock.change_pct > 0 ? "+" : ""}{stock.change_pct ? stock.change_pct.toFixed(2) : "0.00"}% (Hari Ini)
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* 3. CHART & STATS */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
               <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                     <Activity className="w-4 h-4" /> Pergerakan Harga (1 Tahun)
                  </h3>
                  <StockChart ticker={ticker} />
               </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                   { label: "Market Cap", val: "Rp " + fmt(stock.market_cap || 0) }, 
                   { label: "Volume Harian", val: fmt(stock.daily_volume) },
                   { label: "Graham Number", val: fmtCur(stock.graham_number), highlight: true },
                   { 
                     label: "Margin of Safety", 
                     val: (stock.margin_of_safety > 0 ? "+" : "") + (stock.margin_of_safety?.toFixed(1) || 0) + "%", 
                     color: mosColor 
                   }
                ].map((stat, i) => (
                   <Card key={i} className={`bg-zinc-900 border-zinc-800 ${stat.highlight ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
                      <CardContent className="p-4">
                         <div className="text-xs text-zinc-500 uppercase">{stat.label}</div>
                         <div className={`text-lg font-bold font-mono mt-1 ${stat.color || 'text-zinc-200'}`}>
                            {stat.val}
                         </div>
                      </CardContent>
                   </Card>
                ))}
            </div>
         </div>

         {/* 4. VALUATION CARD */}
         <div className="space-y-6">
            <Card className={`border-2 ${mosBg} bg-opacity-5`}>
               <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                     <DollarSign className={`w-6 h-6 ${mosColor}`} />
                     <h2 className="text-xl font-bold text-white">Analisa Nilai Wajar</h2>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Harga Pasar</span>
                        <span className="text-white font-mono">{fmtCur(stock.last_price)}</span>
                     </div>
                     <div className="flex justify-between text-sm border-b border-zinc-700/50 pb-4">
                        <span className="text-zinc-400">Nilai Wajar (Graham)</span>
                        <span className="text-blue-400 font-bold font-mono">{fmtCur(stock.graham_number)}</span>
                     </div>
                     
                     <div className="pt-2">
                        <div className="flex justify-between mb-2">
                           <span className="text-zinc-400 text-sm">Potensi Upside/Downside</span>
                           <span className={`font-bold ${mosColor}`}>
                              {stock.margin_of_safety > 0 ? "+" : ""}{stock.margin_of_safety?.toFixed(1)}%
                           </span>
                        </div>
                        <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                           <div 
                              className={`h-full ${isUndervalued ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.abs(stock.margin_of_safety), 100)}%` }}
                           />
                        </div>
                     </div>
                  </div>

                  <div className={`p-4 rounded-lg text-sm flex gap-3 ${isUndervalued ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'}`}>
                     {isUndervalued ? <Building2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                     <div>
                        {isUndervalued 
                           ? "Saham ini sedang DISKON. Harga pasar lebih rendah dari nilai intrinsik fundamentalnya."
                           : "Saham ini tergolong MAHAL (Premium). Harga pasar melebihi nilai wajarnya."
                        }
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

      </div>
    </div>
  );
}