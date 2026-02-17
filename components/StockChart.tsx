'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartProps {
  data: any[];
  ticker: string;
}

export default function StockChart({ data, ticker }: ChartProps) {
  // Jika data kosong, tampilkan placeholder
  if (!data || data.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 h-96 flex items-center justify-center">
        <p className="text-zinc-500">Belum ada data harga historis.</p>
      </Card>
    );
  }

  // Tentukan warna grafik (Hijau jika harga terakhir > harga awal, Merah jika turun)
  const isUp = data[data.length - 1].close >= data[0].close;
  const color = isUp ? "#4ade80" : "#f87171"; // green-400 : red-400

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-zinc-200 text-sm font-medium uppercase tracking-wider">
          Pergerakan Harga (1 Tahun)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#71717a', fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(str: string) => {
                  const date = new Date(str);
                  return date.toLocaleDateString("id-ID", { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fill: '#71717a', fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => {
                  if (val >= 1000) return `${(val/1000).toFixed(0)}k`;
                  return `${val}`;
                }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                itemStyle={{ color: color }}
                // FIX: Ubah tipe parameter menjadi 'any' agar TypeScript tidak komplain soal undefined
                formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Harga']}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}