// File: frontend/app/components/TradingViewWidget.tsx
'use client';
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    if (container.current && !isScriptLoaded.current) {
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'tradingview-chart-container-main'; // ID Unik
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';
      container.current.appendChild(widgetContainer);

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        if (typeof (window as any).TradingView !== 'undefined') {
          
          // --- KONFIGURASI CHART UTAMA (TERKUNCI) ---
          new (window as any).TradingView.widget({
            "autosize": true,
            "symbol": "IDX:COMPOSITE", // 1. Simbol Terkunci (IHSG)
            "interval": "D",           // 2. Interval Terkunci (Harian)
            "timezone": "Asia/Jakarta",
            "theme": "dark",
            "style": "1",
            "locale": "id",
            
            // --- Fitur Kunci ---
            "allow_symbol_change": false,   // 3. User TIDAK BISA ganti simbol
            "hide_top_toolbar": true,       // 4. Sembunyikan toolbar atas (ganti timeframe/indikator)
            "hide_side_toolbar": true,      // 5. Sembunyikan toolbar gambar
            
            // 6. Indikator Khusus Anda
            "studies": [
              "MovingAverage@tv-basicstudies",
              "RSI@tv-basicstudies"
            ],
            
            "enable_publishing": false,
            "container_id": "tradingview-chart-container-main"
          });
          // --- AKHIR KONFIGURASI ---
          
        }
      };
      
      document.body.appendChild(script);
      isScriptLoaded.current = true;
    }
  }, []);

  return (
    <div ref={container} style={{ height: '100%', width: '100%' }} />
  );
}
export default memo(TradingViewWidget);