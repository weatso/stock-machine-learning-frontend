"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, LayoutList, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url: string;
  last_price: number;
  change_pct: number;
  graham_number: number;
  margin_of_safety: number;
}

export default function StockListPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination & Sorting State
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock; direction: "asc" | "desc" } | null>(null);

  // Fetch semua data HANYA 1 KALI saat mount
  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/stocks/screener?limit=2000`);
        const data = await res.json();
        setStocks(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStocks();
  }, []);

  // 1. Logika Pencarian
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) =>
      (s.ticker || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.company_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [stocks, search]);

  // 2. Logika Sorting Instan di Client Side
  const sortedStocks = useMemo(() => {
    let sortableItems = [...filteredStocks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? (typeof a[sortConfig.key] === "number" ? 0 : "");
        const bValue = b[sortConfig.key] ?? (typeof b[sortConfig.key] === "number" ? 0 : "");

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStocks, sortConfig]);

  // 3. Logika Pagination
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(sortedStocks.length / itemsPerPage);
  
  const paginatedStocks = useMemo(() => {
    if (itemsPerPage === 0) return sortedStocks; // Opsi "All"
    const start = (currentPage - 1) * itemsPerPage;
    return sortedStocks.slice(start, start + itemsPerPage);
  }, [sortedStocks, currentPage, itemsPerPage]);

  // Kalkulasi Indeks untuk Teks "Menampilkan X - Y"
  const startIndex = filteredStocks.length === 0 ? 0 : (itemsPerPage === 0 ? 1 : (currentPage - 1) * itemsPerPage + 1);
  const endIndex = itemsPerPage === 0 ? filteredStocks.length : Math.min(currentPage * itemsPerPage, filteredStocks.length);

  // Reset page ke 1 kalau search atau limit berubah
  useEffect(() => { setCurrentPage(1); }, [search, itemsPerPage]);

  const handleSort = (key: keyof Stock) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: keyof Stock }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === "asc" ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  const formatIDR = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-black text-zinc-100 flex flex-col">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-blue-500" />
            Stock Database
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Total {filteredStocks.length} emiten terdaftar.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Cari Emiten (BBCA)..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
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
                    onClick={() => handleSort(col.id as keyof Stock)}
                  >
                    <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {col.label}
                      <SortIcon column={col.id as keyof Stock} />
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
              ) : paginatedStocks.length > 0 ? (
                paginatedStocks.map((stock) => (
                  <tr 
                    key={stock.ticker} 
                    className="group hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/stocks/${stock.ticker}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700 relative">
                           <img 
                              src={stock.logo_url} 
                              alt={stock.ticker} 
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const parent = target.parentElement;
                                target.style.display = 'none';
                                if (parent) {
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
                    <td className="px-6 py-4"><span className="text-zinc-400 text-xs">{stock.sector || "-"}</span></td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-200">{formatIDR(stock.last_price)}</td>
                    <td className="px-6 py-4 text-right">
                       <span className={`${(stock.change_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                         {(stock.change_pct || 0) > 0 ? "+" : ""}{(stock.change_pct || 0).toFixed(2)}%
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right bg-blue-900/5 text-blue-400 font-bold border-l border-zinc-800">
                        {stock.graham_number > 0 ? formatIDR(stock.graham_number) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`font-bold ${(stock.margin_of_safety || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                         {(stock.margin_of_safety || 0) > 0 ? "+" : ""}
                         {(stock.margin_of_safety || 0).toFixed(1)}%
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {(stock.margin_of_safety || 0) > 20 ? 
                            <span className="px-2 py-1 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">BUY</span> : 
                         (stock.margin_of_safety || 0) > 0 ? 
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

        {/* PAGINATION FOOTER - UPDATED */}
        <div className="bg-zinc-950 border-t border-zinc-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
           {/* KIRI: Dropdown Baris */}
           <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span>Tampilkan:</span>
              <select 
                className="bg-zinc-900 border border-zinc-800 text-white rounded p-1 focus:ring-blue-500 outline-none cursor-pointer"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                 <option value={25}>25</option>
                 <option value={50}>50</option>
                 <option value={100}>100</option>
                 <option value={200}>200</option>
                 <option value={0}>All</option>
              </select>
              <span>Baris</span>
           </div>

           {/* KANAN: Info Text & Navigasi */}
           <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-zinc-400">
              {/* Teks "Menampilkan..." */}
              <span>
                 Menampilkan <span className="text-zinc-200 font-medium">{startIndex}-{endIndex}</span> dari <span className="text-zinc-200 font-medium">{filteredStocks.length}</span> emiten
              </span>
              
              {/* Tombol Next/Prev (Hanya muncul jika bukan mode "All") */}
              {itemsPerPage !== 0 && totalPages > 1 && (
                <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-2">
                   <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronLeft className="w-5 h-5" />
                   </button>
                   <span className="text-zinc-300 font-medium min-w-[3rem] text-center">
                     {currentPage} / {totalPages}
                   </span>
                   <button 
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p - -1))} // Mengakali TS p+1
                     disabled={currentPage === totalPages}
                     className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}