// File: frontend/app/stock/[ticker]/ChartComponent.tsx
    
'use client'; // <-- WAJIB: Komponen ini adalah Client Component
    
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definisikan "bentuk" data chart
interface ChartData {
  date: string;
  close: number;
}

// Definisikan props yang diterima
interface ChartProps {
  ticker: string; // Kita terima ticker sebagai string biasa
}

export default function ChartComponent({ ticker }: ChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!ticker) return;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/api/history/${ticker}`);
        
        // Cek jika data adalah array dan tidak kosong
        if (Array.isArray(response.data) && response.data.length > 0) {
          const formattedData = response.data.map((item: any) => ({
            close: item.close,
            date: new Date(item.date).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'short'
            })
          }));
          setChartData(formattedData);
        } else {
          setChartData([]); // Kosongkan data jika tidak valid
        }

      } catch (error) {
        console.error("Gagal mengambil data chart:", error);
        setError("Gagal memuat data grafik.");
      }
      setLoading(false);
    };

    fetchChartData();
  }, [ticker, apiUrl]); // <-- useEffect akan jalan lagi jika ticker berubah

  // Ini adalah JSX yang akan ditampilkan
  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><p>Memuat grafik...</p></div>;
  }
  
  if (error) {
     return <div className="flex h-full w-full items-center justify-center"><p className="text-red-400">{error}</p></div>;
  }

  if (chartData.length === 0) {
    return <div className="flex h-full w-full items-center justify-center"><p>Data historis tidak ditemukan untuk {ticker}.</p></div>;
  }

  return (
    // ResponsiveContainer mengisi div 70vh dari parent (page.tsx)
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" stroke="#888" fontSize={12} />
        <YAxis 
          stroke="#888" 
          domain={['auto', 'auto']}
          tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value)}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#8884d8' }}
          formatter={(value: number) => [new Intl.NumberFormat('id-ID').format(value), 'Harga']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="close" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          name="Harga Penutupan" 
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}