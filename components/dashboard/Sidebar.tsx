'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, Map as MapIcon, PieChart, Star, Newspaper, 
  Settings, Hexagon, ChevronLeft, Menu 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SettingsDialog } from './SettingsDialog';

const menuItems = [
  { icon: LayoutGrid, label: 'Screener', href: '/dashboard' },
  { icon: MapIcon, label: 'Market Map', href: '/dashboard/map' },
  { icon: PieChart, label: 'Portfolio', href: '/dashboard/portfolio' },
  { icon: Star, label: 'Watchlist', href: '/dashboard/watchlist' },
  { icon: Newspaper, label: 'News & Sentiment', href: '/dashboard/news' },
];

interface SidebarProps {
  width: number;
  isMobile: boolean;
  isOpenMobile: boolean;
  setIsOpenMobile: (val: boolean) => void;
  startResizing: (e: React.MouseEvent) => void;
}

export function Sidebar({ width, isMobile, isOpenMobile, setIsOpenMobile, startResizing }: SidebarProps) {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  // Logic: Jika lebar < 180px, kita anggap "Collapsed"
  const isCollapsed = width < 180;

  return (
    <>
      {/* BACKDROP MOBILE */}
      {isMobile && isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside 
        className={cn(
          "group/sidebar flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 shrink-0 z-50 relative",
          // Matikan transisi lebar saat di Desktop agar drag realtime & smooth
          !isMobile ? "transition-none" : "transition-transform duration-300",
          isMobile ? "fixed left-0 top-0" : "relative",
          isMobile && !isOpenMobile ? "-translate-x-full" : "translate-x-0"
        )}
        style={{ width: isMobile ? 280 : width }} 
      >
        
        {/* WRAPPER KONTEN */}
        <div className="flex flex-col h-full w-full overflow-hidden relative z-10">
            
            {/* === HEADER === */}
            <div className={cn(
            "h-16 flex items-center px-4 border-b border-zinc-800/50 shrink-0",
            isCollapsed ? "justify-center" : "justify-between"
            )}>
              <div className={cn(
                  "flex items-center gap-3 overflow-hidden transition-opacity duration-200",
                  isCollapsed ? "hidden opacity-0" : "flex opacity-100"
              )}>
                  <Hexagon className="w-8 h-8 text-white fill-zinc-900 shrink-0" />
                  <div className="flex flex-col whitespace-nowrap">
                  <span className="font-bold text-lg text-white leading-none">DSS Investasi</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Pro Terminal</span>
                  </div>
              </div>

              {isCollapsed && <Hexagon className="w-8 h-8 text-white fill-zinc-900 shrink-0" />}
            </div>

            {/* === MENU ITEMS === */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                <Link key={item.href} href={item.href} className="block" title={isCollapsed ? item.label : ""}>
                    <div 
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/item whitespace-nowrap",
                        isActive 
                        ? "bg-zinc-100 text-zinc-950" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900",
                        isCollapsed && "justify-center px-0"
                    )}
                    >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-zinc-950" : "text-zinc-500 group-item-hover:text-white")} />
                    
                    <span className={cn(
                        "transition-opacity duration-200",
                        isCollapsed ? "hidden opacity-0 w-0" : "block opacity-100"
                    )}>
                        {item.label}
                    </span>
                    </div>
                </Link>
                )
            })}
            </nav>

            {/* === FOOTER USER === */}
            <div className="p-3 border-t border-zinc-900 bg-zinc-900/30 mt-auto">
              <div className={cn(
                  "flex items-center gap-3 p-2 rounded-xl bg-zinc-900 border border-zinc-800 whitespace-nowrap overflow-hidden",
                  isCollapsed && "justify-center border-none bg-transparent p-0"
              )}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-zinc-700 shrink-0" />
                  
                  <div className={cn("flex-1 overflow-hidden transition-opacity", isCollapsed ? "hidden" : "block")}>
                  <div className="text-sm font-bold text-white truncate">Natanael A.</div>
                  <div className="text-xs text-zinc-500">Pro Plan</div>
                  </div>
                  
                  {!isCollapsed && (
                  <button onClick={() => setShowSettings(true)} className="text-zinc-500 hover:text-white">
                      <Settings className="w-4 h-4" />
                  </button>
                  )}
              </div>
            </div>
        </div>

        {/* === DRAG HANDLE (THE INVISIBLE FAT HANDLE) === */}
        {/* Z-Index 100 untuk memastikan dia selalu di paling atas, di atas konten sidebar maupun dashboard */}
        {!isMobile && (
          <div
            onMouseDown={startResizing}
            className="absolute -right-2 top-0 w-4 h-full cursor-col-resize z-[100] flex justify-center group/resizer hover:bg-transparent"
          >
            {/* Visual Indicator (Garis Biru Tipis saat Hover) */}
            <div className="w-[1px] h-full bg-zinc-800 group-hover/resizer:bg-blue-500 transition-colors delay-75 shadow-[0_0_10px_rgba(59,130,246,0.5)] opacity-0 group-hover/resizer:opacity-100" />
          </div>
        )}

      </aside>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}