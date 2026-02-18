"use client";

import { useEffect, useState } from "react";
import { 
  ArrowUpRight, ArrowDownRight, Search, LayoutList, 
  ArrowUpDown, ArrowUp, ArrowDown 
} from "lucide-react";

interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url: string;
  last_price: number;
  change_pct: number;
  graham_number: number;
  margin_of_safety: number;
  valuation_status: string;
}

export default function StockListPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // STATE SORTING
  const [sortBy, setSortBy] = useState("ticker");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchStocks();
  }, [sortBy, sortOrder]); 

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/stocks/screener?limit=1000&sort_by=${sortBy}&sort_order=${sortOrder}`
      );
      const data = await res.json();
      // Safety check: pastikan data.data adalah array
      setStocks(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === "asc" 
      ? <ArrowUp className="w-3 h-3 text-blue-400" /> 
      : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  const filteredStocks = stocks.filter((s) =>
    s.ticker.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatIDR = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-blue-500" />
            Stock Database
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Klik header tabel untuk mengurutkan.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Cari Ticker (BBCA)..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
              <tr>
                {[
                  { id: "ticker", label: "Emiten" },
                  { id: "sector", label: "Sektor" },
                  { id: "last_price", label: "Harga", align: "right" },
                  { id: "change_pct", label: "% Change", align: "right" },
                  { id: "graham_number", label: "Graham Num", align: "right" },
                  { id: "margin_of_safety", label: "MOS (%)", align: "right" },
                ].map((col) => (
                  <th 
                    key={col.id}
                    className={`px-6 py-4 font-semibold cursor-pointer group hover:bg-zinc-900 hover:text-white transition-colors select-none ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    onClick={() => handleSort(col.id)}
                  >
                    <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {col.label}
                      <SortIcon column={col.id} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse bg-zinc-900"><td colSpan={7} className="px-6 py-4"><div className="h-5 bg-zinc-800 rounded w-full"></div></td></tr>
                ))
              ) : filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <tr 
                    key={stock.ticker} 
                    className="group hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/stocks/${stock.ticker}`}
                  >
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700 relative">
                           {/* LOGO DENGAN LOGIKA ERROR FIX */}
                           <img 
                              src={stock.logo_url} 
                              alt={stock.ticker} 
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const parent = target.parentElement; // SIMPAN PARENT DULU
                                target.style.display = 'none'; // Sembunyikan gambar
                                
                                if (parent) {
                                  // Manipulasi parent aman karena sudah dicek
                                  parent.innerText = stock.ticker[0];
                                  parent.className = "w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700 shrink-0";
                                }
                              }}
                           />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100">{stock.ticker}</div>
                          <div className="text-xs text-zinc-500 truncate max-w-[150px]">{stock.company_name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4"><span className="text-zinc-400 text-xs">{stock.sector}</span></td>
                    
                    <td className="px-6 py-4 text-right font-medium text-zinc-200">{formatIDR(stock.last_price)}</td>
                    
                    <td className="px-6 py-4 text-right">
                       <span className={`${stock.change_pct >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                         {stock.change_pct > 0 ? "+" : ""}{stock.change_pct ? stock.change_pct.toFixed(2) : "0.00"}%
                       </span>
                    </td>

                    <td className="px-6 py-4 text-right bg-blue-900/5 text-blue-400 font-bold border-l border-zinc-800">
                        {stock.graham_number > 0 ? formatIDR(stock.graham_number) : "-"}
                    </td>

                    {/* MOS FIX: Menambahkan Tanda Plus */}
                    <td className="px-6 py-4 text-right">
                       <span className={`font-bold ${stock.margin_of_safety > 0 ? 'text-green-400' : 'text-red-400'}`}>
                         {stock.margin_of_safety > 0 ? "+" : ""}
                         {stock.margin_of_safety ? stock.margin_of_safety.toFixed(1) : "0"}%
                       </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                        {stock.margin_of_safety > 20 ? 
                            <span className="px-2 py-1 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">BUY</span> : 
                         stock.margin_of_safety > 0 ? 
                            <span className="px-2 py-1 rounded text-[10px] bg-green-500/10 text-green-500 border border-green-500/20">FAIR</span> :
                            <span className="px-2 py-1 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">MAHAL</span>
                        }
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-12 text-zinc-500">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}