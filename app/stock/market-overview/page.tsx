"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";

// Tipe Data sesuai Backend
interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url: string;
  last_price: number;
  change_pct: number;
  eps_ttm: number;
  bvps: number;
  graham_number: number;
  margin_of_safety: number;
  valuation_status: string;
}

export default function StockListPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      // Panggil API Backend Anda
      const res = await fetch("http://127.0.0.1:8000/stocks/screener?limit=200&sort=ticker");
      const data = await res.json();
      setStocks(data.data);
    } catch (error) {
      console.error("Gagal ambil data saham:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Client-Side Sederhana untuk Search Bar
  const filteredStocks = stocks.filter((s) =>
    s.ticker.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name.toLowerCase().includes(search.toLowerCase())
  );

  // Format Mata Uang (IDR)
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Stock List</h1>
          <p className="text-gray-500 mt-1">
            Database lengkap saham Indonesia dengan Valuasi Benjamin Graham.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari Ticker atau Perusahaan..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Ticker / Company</th>
                <th className="px-6 py-4 font-semibold">Sector</th>
                <th className="px-6 py-4 font-semibold text-right">Last Price</th>
                <th className="px-6 py-4 font-semibold text-right text-blue-700 bg-blue-50/50">Graham Number</th>
                <th className="px-6 py-4 font-semibold text-right">MOS (%)</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton Loading State
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <tr 
                    key={stock.ticker} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    // Nanti tambahkan onClick ke halaman detail disini
                    onClick={() => window.location.href = `/stocks/${stock.ticker}`}
                  >
                    {/* 1. IDENTITY */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                          {stock.logo_url ? (
                            <img src={stock.logo_url} alt={stock.ticker} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{stock.ticker[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{stock.ticker}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">{stock.company_name}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. SECTOR */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {stock.sector || "-"}
                      </span>
                    </td>

                    {/* 3. PRICE */}
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-gray-900">{formatIDR(stock.last_price)}</div>
                      <div className={`text-xs flex items-center justify-end gap-1 ${stock.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change_pct >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                        {stock.change_pct ? stock.change_pct.toFixed(2) : "0"}%
                      </div>
                    </td>

                    {/* 4. GRAHAM NUMBER (Highlight) */}
                    <td className="px-6 py-4 text-right bg-blue-50/30">
                      <div className="font-bold text-blue-700">
                        {stock.graham_number > 0 ? formatIDR(stock.graham_number) : "-"}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        EPS: {stock.eps_ttm?.toFixed(0)} | BV: {stock.bvps?.toFixed(0)}
                      </div>
                    </td>

                    {/* 5. MOS % */}
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${stock.margin_of_safety > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {stock.margin_of_safety ? stock.margin_of_safety.toFixed(1) : "0"}%
                      </span>
                    </td>

                    {/* 6. STATUS */}
                    <td className="px-6 py-4 text-center">
                      {stock.margin_of_safety > 20 ? (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          BUY
                        </span>
                      ) : stock.margin_of_safety > 0 ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                          Fair
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                          Mahal
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Tidak ada saham yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER / PAGINATION INFO */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>Menampilkan {filteredStocks.length} saham</span>
          <span>Data Fundamental: Kuartal Terakhir (TTM)</span>
        </div>
      </div>
    </div>
  );
}