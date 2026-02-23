"use client";

import { useEffect, useState, useMemo } from "react";
import { Newspaper, Search, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface MarketNews {
  id: string;
  title: string;
  link: string;
  published_at: string;
  source: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  insight: string;
  affected_tickers: string[];
}

export default function AINewsPage() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<"ALL" | "BULLISH" | "BEARISH" | "NEUTRAL">("ALL");

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/news?limit=100`);
        const json = await res.json();
        setNews(json.data || []);
      } catch (err) {
        console.error("Gagal mengambil berita:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Filter logika di Client Side agar instan
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchSentiment = filterSentiment === "ALL" || item.sentiment === filterSentiment;
      const matchTicker = searchTicker === "" || 
        item.affected_tickers.some(t => t.toLowerCase().includes(searchTicker.toLowerCase())) ||
        item.title.toLowerCase().includes(searchTicker.toLowerCase());
      
      return matchSentiment && matchTicker;
    });
  }, [news, searchTicker, filterSentiment]);

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "BEARISH": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH": return <TrendingUp className="w-4 h-4" />;
      case "BEARISH": return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100 flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-500" />
            AI News Terminal
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Agregasi berita pasar dengan analisis sentimen institusional via Gemini 2.5.</p>
        </div>
        
        {/* Kontrol Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            className="bg-zinc-900 border border-zinc-800 text-sm rounded-lg px-3 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value as any)}
          >
            <option value="ALL">Semua Sentimen</option>
            <option value="BULLISH">Bullish</option>
            <option value="BEARISH">Bearish</option>
            <option value="NEUTRAL">Neutral</option>
          </select>

          <div className="relative group flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500" />
            <input 
              type="text"
              placeholder="Cari Emiten (Cth: BBCA)..."
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Daftar Berita */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
             <div className="w-8 h-8 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
             <p>Sinkronisasi AI...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <p className="text-zinc-400">Tidak ada berita yang sesuai dengan kriteria.</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col gap-4">
              
              {/* Baris Atas: Sumber, Waktu, Sentimen */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                  <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-300">{item.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(item.published_at), { addSuffix: true, locale: id })}
                  </span>
                </div>
                
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold tracking-wider ${getSentimentStyle(item.sentiment)}`}>
                  {getSentimentIcon(item.sentiment)}
                  {item.sentiment}
                </div>
              </div>

              {/* Judul & Emiten Terkait */}
              <div>
                <a href={item.link} target="_blank" rel="noreferrer" className="text-lg font-bold text-zinc-100 hover:text-blue-400 transition-colors flex items-start gap-2 group">
                  {item.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                </a>
                
                {item.affected_tickers && item.affected_tickers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.affected_tickers.map(t => (
                      <button 
                        key={t}
                        onClick={() => window.open(`/dashboard/stocks/${t}`, "_blank")}
                        className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                      >
                        ${t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Insight Box */}
              <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-3.5 flex gap-3 items-start">
                <Bot className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-zinc-400 mb-1 tracking-wider">AI INSIGHT</div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{item.insight}</p>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}