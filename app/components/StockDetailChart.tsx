// File: frontend/app/components/StockDetailChart.tsx
'use client';
import React, { useEffect, useRef, memo } from 'react';

// Terima 'ticker' sebagai properti
interface StockChartProps {
  ticker: string;
}

function StockDetailChart({ ticker }: StockChartProps) {
  const container = useRef<HTMLDivElement>(null);

  // Kita tidak perlu 'isScriptLoaded' karena script tv.js
  // sudah dimuat oleh halaman utama.
  
  // Kita perlu me-render ulang chart jika 'ticker' berubah
  useEffect(() => {
    if (container.current) {
      // Bersihkan chart lama sebelum menggambar yg baru
      container.current.innerHTML = ''; 
      
      // Buat container baru untuk widget
      const widgetContainer = document.createElement('div');
      widgetContainer.id = `tradingview-detail-${ticker}`; // ID Dinamis
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';
      container.current.appendChild(widgetContainer);

      // Pastikan library TradingView sudah ada
      if (typeof (window as any).TradingView !== 'undefined') {
        
        // --- KONFIGURASI CHART DETAIL (INTERAKTIF) ---
        new (window as any).TradingView.widget({
          "autosize": true,
          "symbol": `IDX:${ticker}`, // 1. Simbol Dinamis dari props
          "interval": "D",
          "timezone": "Asia/Jakarta",
          "theme": "dark",
          "style": "1",
          "locale": "id",
          
          // --- Fitur Interaktif ---
          "allow_symbol_change": true, // 2. User BISA ganti simbol
          "hide_top_toolbar": false,   // 3. Toolbar atas TAMPIL
          "hide_side_toolbar": false,  // 4. Toolbar gambar TAMPIL
          
          "enable_publishing": false,
          "container_id": `tradingview-detail-${ticker}`
        });
        // --- AKHIR KONFIGURASI ---
      }
    }
  }, [ticker]); // <-- Jalankan ulang efek ini jika 'ticker' berubah

  return (
    <div ref={container} style={{ height: '100%', width: '100%' }} />
  );
}
export default memo(StockDetailChart);