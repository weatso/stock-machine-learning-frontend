"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search, LayoutList } from "lucide-react";

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
      // Panggil API dengan sort=ticker (A-Z)
      const res = await fetch("http://127.0.0.1:8000/stocks/screener?limit=1000&sort=ticker");
      const data = await res.json();
      setStocks(data.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Search di Client side
  const filteredStocks = stocks.filter((s) =>
    s.ticker.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatIDR = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-gray-600" />
            Daftar Saham Indonesia
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Database lengkap dengan valuasi Benjamin Graham.
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari Ticker (BBCA) atau Perusahaan..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Emiten</th>
                <th className="px-6 py-3 font-semibold">Sektor</th>
                <th className="px-6 py-3 font-semibold text-right">Harga Pasar</th>
                <th className="px-6 py-3 font-semibold text-right bg-blue-50 text-blue-800">Graham Num</th>
                <th className="px-6 py-3 font-semibold text-right">MOS (%)</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Loading Skeleton
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredStocks.map((stock) => (
                <tr 
                  key={stock.ticker} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  // Link ke halaman detail (Nanti kita buat halaman ini)
                  onClick={() => window.location.href = `/dashboard/stocks/${stock.ticker}`}
                >
                  {/* Identity */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        {stock.logo_url ? (
                          <img src={stock.logo_url} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-xs font-bold text-gray-400">{stock.ticker[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {stock.ticker}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {stock.company_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sector */}
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {stock.sector || "Lainnya"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-3 text-right">
                    <div className="font-medium text-gray-900">{formatIDR(stock.last_price)}</div>
                    <div className={`text-xs flex items-center justify-end gap-1 ${stock.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change_pct >= 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                      {stock.change_pct ? stock.change_pct.toFixed(2) : "0"}%
                    </div>
                  </td>

                  {/* Graham Number (Highlight) */}
                  <td className="px-6 py-3 text-right bg-blue-50/50">
                    <div className="font-bold text-blue-700">
                      {stock.graham_number > 0 ? formatIDR(stock.graham_number) : "-"}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Fair Value
                    </div>
                  </td>

                  {/* MOS */}
                  <td className="px-6 py-3 text-right">
                    <span className={`font-bold ${stock.margin_of_safety > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stock.margin_of_safety ? stock.margin_of_safety.toFixed(1) : "0"}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3 text-center">
                    {stock.margin_of_safety > 20 ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                        BUY
                      </span>
                    ) : stock.margin_of_safety > 0 ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">
                        FAIR
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-100">
                        EXPENSIVE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}