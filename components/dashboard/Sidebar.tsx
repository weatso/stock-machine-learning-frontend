"use client";

import { cn } from "@/lib/utils"; // Pastikan Anda punya utility cn, atau hapus dan pakai string biasa
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LayoutList,
  List, // Ikon baru untuk Stock List
  Map,
  Newspaper,
  PieChart,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const MIN_WIDTH = 64; // Lebar saat collapsed (hanya ikon)
const MAX_WIDTH = 300; // Lebar maksimal
const DEFAULT_WIDTH = 240; // Lebar default

export default function Sidebar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load preferences dari localStorage saat mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);

    if (savedWidth) setWidth(parseInt(savedWidth));
    if (savedCollapsed) setIsCollapsed(savedCollapsed === "true");
  }, []);

  // Handle Resize Logic
  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString());
  };

  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) {
        setWidth(newWidth);
        // Jika ditarik terlalu kecil, otomatis collapse
        if (newWidth < 100 && !isCollapsed) {
          setIsCollapsed(true);
        } else if (newWidth > 100 && isCollapsed) {
          setIsCollapsed(false);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, isCollapsed]);

  // Toggle Collapse Manual
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setWidth(newState ? MIN_WIDTH : DEFAULT_WIDTH);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // MENU ITEMS CONFIGURATION
  const menuItems = [
    {
      name: "Dashboard",
      href: "/stock",
      icon: LayoutDashboard,
      current: pathname === "/stock",
    },
    {
      name: "Stock List", // NAMA BARU
      href: "/stock/stocks", // LINK BARU
      icon: LayoutList, // IKON BARU
      current: pathname === "/stock/stocks" || pathname.startsWith("/stock/stocks/"),
    },
    {
      name: "Market Map",
      href: "/stock/map",
      icon: Map,
      current: pathname === "/stock/map",
    },
    {
      name: "Portfolio",
      href: "/stock/portfolio",
      icon: PieChart,
      current: pathname === "/stock/portfolio",
    },
    {
      name: "Watchlist",
      href: "/stock/watchlist",
      icon: List,
      current: pathname === "/stock/watchlist",
    },
    {
      name: "News & Sentiment",
      href: "/stock/news",
      icon: Newspaper,
      current: pathname === "/stock/news",
    },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-75 ease-linear group",
        isResizing ? "select-none" : ""
      )}
      style={{ width: width }}
    >
      {/* 1. HEADER / LOGO */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              W
            </div>
            <span>WEATSO</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION LIST */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group/item relative",
              item.current
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              isCollapsed ? "justify-center" : ""
            )}
            title={isCollapsed ? item.name : undefined} // Tooltip native saat collapsed
          >
            <item.icon
              className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                item.current ? "text-blue-600" : "text-gray-400 group-hover/item:text-gray-600"
              )}
            />

            {!isCollapsed && (
              <span className="truncate">{item.name}</span>
            )}

            {/* Indikator Active (Dot biru kecil di kanan jika collapsed) */}
            {isCollapsed && item.current && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* 3. BOTTOM ACTIONS (Settings & Collapse) */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          href="/stock/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 text-gray-400" />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {/* Tombol Collapse Manual */}
        <button
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* 4. DRAG HANDLE (Garis Penarik di Kanan) */}
      <div
        className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors z-50 opacity-0 hover:opacity-100"
        onMouseDown={startResizing}
        title="Drag to resize sidebar"
      />
    </aside>
  );
}