// File: frontend/app/components/StockDetailChart.tsx
'use client';

import React, { useEffect, useRef, memo } from 'react';

interface StockChartProps {
  ticker: string;
}

function StockDetailChart({ ticker }: StockChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // PENJAGA: Jika ticker kosong/undefined, jangan lakukan apa-apa
    if (!ticker || !container.current) return;

    // Bersihkan container sebelum render ulang
    container.current.innerHTML = ''; 
    
    const widgetContainer = document.createElement('div');
    widgetContainer.id = `tradingview-detail-${ticker}`;
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    container.current.appendChild(widgetContainer);

    if (typeof (window as any).TradingView !== 'undefined') {
      new (window as any).TradingView.widget({
        "autosize": true,
        "symbol": `IDX:${ticker}`, // Pastikan ticker masuk di sini
        "interval": "D",
        "timezone": "Asia/Jakarta",
        "theme": "dark",
        "style": "1",
        "locale": "id",
        "allow_symbol_change": true,
        "hide_top_toolbar": false,
        "hide_side_toolbar": false,
        "enable_publishing": false,
        "container_id": `tradingview-detail-${ticker}`
      });
    }
  }, [ticker]); // Jalankan ulang jika ticker berubah

  return (
    <div ref={container} style={{ height: '100%', width: '100%' }} />
  );
}

export default memo(StockDetailChart);