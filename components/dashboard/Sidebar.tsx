"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutList,
  Map,
  PieChart,
  List,
  Newspaper,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

// Kunci untuk menyimpan preferensi user di LocalStorage
const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const MIN_WIDTH = 64; 
const MAX_WIDTH = 300; 
const DEFAULT_WIDTH = 240; 

export default function Sidebar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load preferensi posisi sidebar saat reload
  useEffect(() => {
    const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    
    if (savedWidth) setWidth(parseInt(savedWidth));
    if (savedCollapsed) setIsCollapsed(savedCollapsed === "true");
  }, []);

  // --- LOGIKA RESIZE (TETAP SAMA) ---
  const startResizing = () => setIsResizing(true);
  const stopResizing = () => {
    setIsResizing(false);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString());
  };

  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) {
        setWidth(newWidth);
        if (newWidth < 100 && !isCollapsed) setIsCollapsed(true);
        else if (newWidth > 100 && isCollapsed) setIsCollapsed(false);
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

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setWidth(newState ? MIN_WIDTH : DEFAULT_WIDTH);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // --- KONFIGURASI MENU ---
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Stock List",
      href: "/dashboard/stocks",
      icon: LayoutList,
      current: pathname.startsWith("/dashboard/stocks"),
    },
    {
      name: "Market Map",
      href: "/dashboard/map",
      icon: Map,
      current: pathname === "/dashboard/map",
    },
    {
      name: "Portfolio",
      href: "/dashboard/portfolio",
      icon: PieChart,
      current: pathname === "/dashboard/portfolio",
    },
    {
      name: "Watchlist",
      href: "/dashboard/watchlist",
      icon: List,
      current: pathname === "/dashboard/watchlist",
    },
    {
      name: "News & Sentiment",
      href: "/dashboard/news",
      icon: Newspaper,
      current: pathname === "/dashboard/news",
    },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        // UBAH WARNA DI SINI: bg-white -> bg-zinc-950, border-gray-200 -> border-zinc-800
        "relative flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-75 ease-linear group z-20 text-zinc-400",
        isResizing ? "select-none" : ""
      )}
      style={{ width: width }}
    >
      {/* HEADER LOGO */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 font-bold text-xl text-zinc-100 overflow-hidden whitespace-nowrap">
            <span className="tracking-tight">WEATSO</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          </div>
        )}
      </div>

      {/* MENU LIST */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group/item relative",
              item.current
                ? "bg-blue-600/10 text-blue-400" // Active State Dark Mode
                : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100", // Inactive State Dark Mode
              isCollapsed ? "justify-center" : ""
            )}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon
              className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                item.current ? "text-blue-400" : "text-zinc-600 group-hover/item:text-zinc-300"
              )}
            />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
            
            {isCollapsed && item.current && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* BOTTOM ACTIONS */}
      <div className="p-3 border-t border-zinc-800 space-y-1 shrink-0">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300" />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100 transition-colors",
             isCollapsed ? "justify-center" : ""
          )}
        >
          {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : (
            <>
              <ChevronsLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* RESIZER HANDLE */}
      <div
        className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 transition-colors z-50 opacity-0 hover:opacity-100"
        onMouseDown={startResizing}
      />
    </aside>
  );
}