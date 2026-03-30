"use client";

import { useEffect, useRef } from 'react';

export default function StockChart({ ticker }: { ticker: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `IDX:${ticker}`,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "id",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_widget"
    });
    container.current?.appendChild(script);
  }, [ticker]);

  return <div id="tradingview_widget" ref={container} className="h-full w-full" />;
}