// File: frontend/app/stock/[ticker]/page.tsx

// Hapus 'use client' - ini adalah Server Component
// 1. Impor komponen chart DETAIL yang baru (path-nya harus benar)
import StockDetailChart from '../../components/StockDetailChart';

interface StockDetailProps {
  params: {
    ticker: string;
  };
}

export default async function StockDetail({ params }: StockDetailProps) {
  
  // Ambil ticker dari URL (aman di Server Component)
  const ticker = decodeURIComponent(params.ticker); 

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Detail Saham: {ticker}
      </h1>
      
      {/* Kita beri tinggi yang pasti (misal 70vh) */}
      <div className="h-[70vh] w-full rounded-lg shadow-lg overflow-hidden border border-gray-700">
        
        {/* 2. Panggil komponen BARU dan berikan 'ticker' */}
        <StockDetailChart ticker={ticker} />
        
      </div>
    </div>
  );
}