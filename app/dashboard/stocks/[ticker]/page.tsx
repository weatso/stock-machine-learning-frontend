"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Bot, AlertTriangle, Activity, Newspaper } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface AINews {
  title: string;
  link: string;
  published_at: string;
  source: string;
  sentiment: string;
  insight: string;
}

interface StockProfile {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url: string;
  last_price: number;
  change_pct: number;
  daily_volume: number;
  valuation_status: string;
  margin_of_safety: number;
  graham_number: number;
  eps_ttm: number;
  bvps: number;
  per: number;
  pbv: number;
  roe: number;
  roa: number;
  der: number;
  npm: number;
  ai_news: AINews[];
}

export default function StockProfilePage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;

  const [data, setData] = useState<StockProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ticker) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/stocks/profile/${ticker}`);
        if (!res.ok) throw new Error("Emiten tidak ditemukan atau server bermasalah.");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [ticker]);

  const formatIDR = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num || 0);
  const formatNum = (num: number) => (num || 0).toLocaleString("id-ID");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-500 gap-4">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="font-medium tracking-widest uppercase text-xs">Menyusun Profil Emiten...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-500 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500/50" />
        <p>{error || "Data tidak tersedia."}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded transition-colors text-sm">
          Kembali ke Screener
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-black text-zinc-100 max-w-7xl mx-auto">
      {/* Tombol Kembali */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali
      </button>

      {/* Header Emiten */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border-2 border-zinc-700">
            <img 
              src={data.logo_url} 
              alt={data.ticker} 
              className="w-full h-full object-contain p-2"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{data.ticker}</h1>
              <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-bold tracking-wider uppercase border border-zinc-700">
                {data.sector || "SEKTOR TIDAK DIKETAHUI"}
              </span>
            </div>
            <p className="text-zinc-400 text-sm md:text-base font-medium">{data.company_name}</p>
          </div>
        </div>

        <div className="text-left md:text-right w-full md:w-auto border-t border-zinc-800 md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
          <div className="text-zinc-500 text-xs font-bold tracking-wider mb-1">HARGA TERAKHIR</div>
          <div className="flex items-center md:justify-end gap-3">
            <div className="text-3xl font-bold text-white">{formatIDR(data.last_price)}</div>
            <div className={`flex items-center gap-1 font-bold px-2 py-1 rounded ${data.change_pct >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {data.change_pct > 0 ? <TrendingUp className="w-4 h-4" /> : data.change_pct < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              {data.change_pct > 0 ? "+" : ""}{(data.change_pct || 0).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: Valuasi & Fundamental */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Panel Margin of Safety */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <Activity className="w-32 h-32" />
             </div>
             <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                Valuasi Intrinsic (Benjamin Graham)
             </h2>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div>
                   <div className="text-zinc-500 text-xs font-bold mb-1">NILAI WAJAR (GRAHAM NUM)</div>
                   <div className="text-2xl font-bold text-blue-400">{data.graham_number > 0 ? formatIDR(data.graham_number) : "N/A"}</div>
                </div>
                <div>
                   <div className="text-zinc-500 text-xs font-bold mb-1">MARGIN OF SAFETY</div>
                   <div className={`text-2xl font-bold ${(data.margin_of_safety || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(data.margin_of_safety || 0) > 0 ? "+" : ""}{(data.margin_of_safety || 0).toFixed(2)}%
                   </div>
                </div>
                <div>
                   <div className="text-zinc-500 text-xs font-bold mb-1">STATUS VALUASI</div>
                   <div className={`inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold border 
                      ${data.valuation_status === 'Undervalued' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                        data.valuation_status === 'Fair' ? 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' : 
                        'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {data.valuation_status?.toUpperCase() || "UNKNOWN"}
                   </div>
                </div>
             </div>
          </div>

          {/* Panel Rasio Keuangan */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
             <h2 className="text-lg font-bold text-white mb-6">Metrik Fundamental (TTM)</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                {[
                  { label: "EPS", value: formatIDR(data.eps_ttm) },
                  { label: "BVPS", value: formatIDR(data.bvps) },
                  { label: "PER", value: `${(data.per || 0).toFixed(2)}x` },
                  { label: "PBV", value: `${(data.pbv || 0).toFixed(2)}x` },
                  { label: "ROE", value: `${(data.roe || 0).toFixed(2)}%` },
                  { label: "ROA", value: `${(data.roa || 0).toFixed(2)}%` },
                  { label: "DER", value: `${(data.der || 0).toFixed(2)}%` },
                  { label: "NPM", value: `${(data.npm || 0).toFixed(2)}%` },
                ].map((item, idx) => (
                  <div key={idx} className="border-l-2 border-zinc-800 pl-3">
                    <div className="text-zinc-500 text-[10px] sm:text-xs font-bold tracking-wider mb-1">{item.label}</div>
                    <div className="text-white font-medium sm:text-lg">{item.value !== "Rp\xa00" && item.value !== "0.00x" && item.value !== "0.00%" ? item.value : "-"}</div>
                  </div>
                ))}
             </div>
          </div>
          
        </div>

        {/* KOLOM KANAN: AI News Stream */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-full max-h-[800px]">
          <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
             <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" /> AI News Sentiment
             </h2>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {!data.ai_news || data.ai_news.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 gap-2 opacity-60">
                  <Newspaper className="w-10 h-10 mb-2" />
                  <p className="text-sm">Tidak ada berita terbaru yang secara spesifik menyinggung {data.ticker}.</p>
               </div>
            ) : (
               data.ai_news.map((news, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-4 group">
                     <div className="flex justify-between items-start mb-2 gap-2">
                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{news.source}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border 
                          ${news.sentiment === 'BULLISH' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            news.sentiment === 'BEARISH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                           {news.sentiment}
                        </span>
                     </div>
                     <a href={news.link} target="_blank" rel="noreferrer" className="text-sm font-bold text-zinc-200 hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                        {news.title}
                     </a>
                     <div className="text-xs text-zinc-400 mb-3 flex items-center gap-1">
                        {formatDistanceToNow(new Date(news.published_at), { addSuffix: true, locale: id })}
                     </div>
                     <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800/50 text-xs text-zinc-300 leading-relaxed border-l-2 border-l-blue-500">
                        {news.insight}
                     </div>
                  </div>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}