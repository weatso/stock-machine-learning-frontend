"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Map, Loader2 } from "lucide-react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

// --- CUSTOM CELL UNTUK WARNA HEATMAP ---
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, name } = props;

  if (depth === 1) {
    // Label Sektor (Background transparan, garis batas tegas)
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="transparent" stroke="#27272a" strokeWidth={2} />
        {width > 50 && height > 20 && (
          <text x={x + 4} y={y + 16} fill="#71717a" fontSize={11} fontWeight="bold" className="uppercase tracking-wider">
            {name}
          </text>
        )}
      </g>
    );
  }

  if (depth === 2) {
    // Kotak Saham Individu
    const change = payload.change || 0;
    
    // Logika Warna ala Terminal Institusi:
    let bgColor = "#27272a"; // Neutral (abu-abu)
    if (change >= 3) bgColor = "#16a34a"; // Hijau Tua
    else if (change > 0) bgColor = "#22c55e"; // Hijau Terang
    else if (change <= -3) bgColor = "#dc2626"; // Merah Tua
    else if (change < 0) bgColor = "#ef4444"; // Merah Terang

    return (
      <g>
        <rect 
          x={x} y={y} width={width} height={height} 
          fill={bgColor} 
          stroke="#000" 
          strokeWidth={1} 
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          onClick={() => window.location.href = `/dashboard/stocks/${name}`}
        />
        {/* Tampilkan Ticker & Change hanya jika kotak cukup besar */}
        {width > 40 && height > 30 && (
          <>
            <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
              {name}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={10}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </text>
          </>
        )}
      </g>
    );
  }
  return null;
};

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.change) return null; // Abaikan tooltip untuk background grup sektor
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-sm z-50">
        <div className="font-bold text-white text-lg">{data.name}</div>
        <div className="flex gap-4 mt-2">
          <div>
            <div className="text-zinc-500 text-xs">Perubahan</div>
            <div className={`font-bold ${data.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {data.change > 0 ? "+" : ""}{data.change.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs">Estimasi Transaksi</div>
            <div className="text-zinc-200 font-medium">
               Rp {(data.size / 1000000000).toFixed(1)} Miliar
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export default function MarketMapPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/stats/heatmap");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Gagal mengambil data heatmap:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100 flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-500" />
            Market Heatmap
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Peta kekuatan pasar berdasarkan Sektor & Nilai Transaksi Harian.</p>
        </div>
        <div className="hidden md:flex gap-3 text-xs font-medium">
           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#16a34a] rounded-sm"></span> &ge; 3%</div>
           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#22c55e] rounded-sm"></span> &lt; 3%</div>
           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#ef4444] rounded-sm"></span> &gt; -3%</div>
           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#dc2626] rounded-sm"></span> &le; -3%</div>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 flex-1 min-h-[600px] overflow-hidden relative">
         <CardContent className="p-2 h-full w-full absolute inset-0">
            {loading ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span>Mengalkulasi turnover miliaran rupiah...</span>
               </div>
            ) : data.length === 0 ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <p>Data transaksi belum tersedia.</p>
                  <p className="text-xs">Pastikan worker YFinance sudah mendeteksi volume harian (hari bursa aktif).</p>
               </div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={data}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomizedContent />}
                  >
                    <Tooltip content={<CustomTooltip />} />
                  </Treemap>
               </ResponsiveContainer>
            )}
         </CardContent>
      </Card>
    </div>
  );
}