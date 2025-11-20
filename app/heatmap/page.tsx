// File: frontend/app/heatmap/page.tsx

'use client'; // WAJIB, untuk tombol filter (useState)

import { useState, useEffect } from 'react';
import axios from 'axios';

// Definisikan tipe data untuk performa sektor
interface SectorPerformance {
  sector_id: number;
  sector_name: string;
  avg_daily_change: number;
  avg_weekly_change: number;
  avg_monthly_change: number;
}

// Definisikan tipe periode (Harian, Mingguan, Bulanan)
type TimePeriod = 'daily' | 'weekly' | 'monthly';

export default function HeatmapPage() {
  // State untuk menyimpan data mentah dari API
  const [sectorData, setSectorData] = useState<SectorPerformance[]>([]);
  // State untuk tombol filter
  const [period, setPeriod] = useState<TimePeriod>('daily'); // Default 'daily'
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Ambil data dari API saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/api/heatmap`);
        setSectorData(response.data);
      } catch (err) {
        console.error("Gagal mengambil data heatmap:", err);
        setError("Gagal memuat data heatmap.");
      }
      setLoading(false);
    };

    fetchHeatmapData();
  }, [apiUrl]);

  // --- FUNGSI BARU UNTUK GRADASI WARNA ---
  const getColor = (value: number) => {
    // Tentukan batas persentase (misal: 3% = warna penuh)
    // Anda bisa ubah angka '3.0' ini jika gradasinya terlalu cepat/lambat
    const maxPercent = 3.0;

    // 1. Tentukan HUE (Warna)
    // 0 untuk Merah (negatif), 120 untuk Hijau (positif)
    const hue = value >= 0 ? 120 : 0;

    // 2. Tentukan 'percent' (0.0 s/d 1.0)
    // Ini adalah seberapa 'kuat' warnanya, mentok di maxPercent
    const percent = Math.min(Math.abs(value), maxPercent) / maxPercent;

    // 3. Hitung Saturasi & Kecerahan
    // Saat 'percent' = 0 (nilai 0%):
    //   Saturasi = 0% (abu-abu)
    //   Kecerahan = 90% (abu-abu muda)
    // Saat 'percent' = 1 (nilai 3% atau lebih):
    //   Saturasi = 70% (warna pekat)
    //   Kecerahan = 50% (warna murni)
    
    const saturation = percent * 70; // 0% -> 70%
    const lightness = 90 - (percent * 40); // 90% -> 50%

    // 4. Kembalikan string warna HSL
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Fungsi untuk mendapatkan data yang akan ditampilkan berdasarkan filter
  const getDisplayData = (sector: SectorPerformance) => {
    switch (period) {
      case 'daily':
        return sector.avg_daily_change;
      case 'weekly':
        return sector.avg_weekly_change;
      case 'monthly':
        return sector.avg_monthly_change;
      default:
        return 0;
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Sector Heatmap</h1>
      <p className="mb-6 text-gray-400">
        Menampilkan performa rata-rata sektor berdasarkan data historis.
      </p>

      {/* --- Tombol Filter --- */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded-lg ${period === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Daily
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`px-4 py-2 rounded-lg ${period === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-lg ${period === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Monthly
        </button>
      </div>

      {/* --- Kontainer Heatmap --- */}
      {loading && <p>Memuat data heatmap...</p>}
      {error && <p className="text-red-400">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectorData.map((sector) => {
            const displayValue = getDisplayData(sector);
            const color = getColor(displayValue);
            
            return (
              <div
                key={sector.sector_id}
                style={{ backgroundColor: color }}
                className="p-4 rounded-lg shadow-lg flex flex-col justify-between h-36 transition-all duration-300"
              >
                <div className="font-bold text-lg text-black">
                  {sector.sector_name}
                </div>
                <div className="font-mono text-3xl font-bold text-black text-right">
                  {displayValue.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}