// File: frontend/app/components/SearchBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

interface SearchResult {
  ticker: string;
  company_name: string;
  sector_name: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Logika Debounce & Fetching
  useEffect(() => {
    // Jangan cari jika query kosong
    if (!query) {
      setResults([]);
      return;
    }

    // Tunggu 300ms setelah user selesai mengetik baru cari (agar hemat API)
    const delayDebounce = setTimeout(async () => {
      try {
        // Panggil API yang sudah ada, limit 5 hasil saja
        const res = await axios.get(`${apiUrl}/api/dashboard/all-stocks`, {
          params: { search: query, limit: 5 }
        });
        setResults(res.data);
        setIsOpen(true);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, apiUrl]);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Fungsi saat user memilih saham
  const handleSelect = (ticker: string) => {
    router.push(`/stock/${ticker}`);
    setIsOpen(false);
    setQuery(''); // Bersihkan pencarian
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      
      {/* Input Box */}
      <div className="relative">
        <input
          type="text"
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md transition-all"
          placeholder="Cari saham (cth: BBCA, Telkom)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaSearch />
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          <ul>
            {results.map((stock) => (
              <li 
                key={stock.ticker}
                onClick={() => handleSelect(stock.ticker)}
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 flex justify-between items-center transition-colors"
              >
                <div>
                  <span className="font-bold text-blue-400 mr-2">{stock.ticker}</span>
                  <span className="text-gray-300 text-sm truncate max-w-[200px] inline-block align-bottom">
                    {stock.company_name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                  {stock.sector_name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Tampilan jika tidak ada hasil */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 text-center text-gray-400">
          Tidak ditemukan.
        </div>
      )}
    </div>
  );
}