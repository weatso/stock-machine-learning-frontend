'use client';

import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';

// Kustomisasi Tampilan Kotak (Content)
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, colors, name, value, valuation_score } = props;

  // Tentukan warna berdasarkan "Mahal/Murah" (Graham Score)
  // valuation_score 1 = Sangat Murah (Hijau Pekat)
  // valuation_score 0 = Sangat Mahal (Merah Pekat)
  let fillColor = "#ef4444"; // Default Merah (Mahal)
  
  if (valuation_score > 0.8) fillColor = "#15803d"; // Hijau Tua (Sangat Murah)
  else if (valuation_score > 0.5) fillColor = "#22c55e"; // Hijau (Murah)
  else if (valuation_score > 0.3) fillColor = "#eab308"; // Kuning (Wajar)
  else fillColor = "#b91c1c"; // Merah (Mahal)

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: '#18181b', // Border Zinc-900
          strokeWidth: 2,
          opacity: 1,
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 4, 14)}
          fontWeight="bold"
          dominantBaseline="central"
        >
          {name}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded shadow-xl text-xs">
        <p className="font-bold text-white text-sm mb-1">{data.name}</p>
        <p className="text-zinc-400">Market Cap: <span className="text-white font-mono">Rp{(data.value / 1000000000).toFixed(0)} M</span></p>
        <p className="text-zinc-400">Status: <span className={data.valuation_score > 0.5 ? "text-green-400" : "text-red-400"}>
          {data.valuation_score > 0.5 ? "Undervalued" : "Overvalued"}
        </span></p>
      </div>
    );
  }
  return null;
};

interface HeatmapProps {
  data: any[];
}

export default function ValuationHeatmap({ data }: HeatmapProps) {
  const router = useRouter();

  // Transform Data Flat ke Hirarki Treemap (By Sector)
  // Format Recharts Treemap butuh children nested
  
  // 1. Group by Sector
  const sectors: any = {};
  data.forEach(stock => {
    const sectorName = stock.sectors?.name || "Unknown";
    if (!sectors[sectorName]) sectors[sectorName] = { name: sectorName, children: [] };
    
    // Hitung Score Sederhana (0 - 1)
    // Jika PER < 15 dan PBV < 1.5 => Score tinggi
    let score = 0;
    if (stock.fundamental_per > 0 && stock.fundamental_per < 25) score += 0.5;
    if (stock.fundamental_per > 0 && stock.fundamental_per < 10) score += 0.3; // Bonus murah banget
    if (stock.fundamental_pbv > 0 && stock.fundamental_pbv < 1.5) score += 0.2;
    
    // Hindari market cap 0 biar gak error
    const size = stock.market_cap > 0 ? stock.market_cap : 1000000000;

    sectors[sectorName].children.push({
      name: stock.ticker,
      size: size, // Ukuran kotak = Market Cap
      valuation_score: score // Warna kotak = Valuasi
    });
  });

  const treeData = Object.values(sectors);

  return (
    <div className="w-full h-[600px] bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10 flex gap-4 text-xs font-medium bg-zinc-950/80 p-2 rounded border border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-600 rounded-sm"></div> Undervalued</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Fair</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Overvalued</div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
          onClick={(node) => {
            if (node && node.name) {
              router.push(`/dashboard/stocks/${node.name}`);
            }
          }}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}