'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // === STATE WIDTH ===
  // Default 260px. Batas Bawah 80px (Icon Mode). Batas Atas 400px.
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // === DRAG LOGIC ===
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        // Hitung lebar baru berdasarkan posisi mouse X
        const newWidth = mouseMoveEvent.clientX;
        
        // Batasan (Constraints)
        if (newWidth < 80) return setSidebarWidth(80); // Jangan lebih kecil dari 80px
        if (newWidth > 400) return setSidebarWidth(400); // Jangan lebih besar dari 400px
        
        // Snapping Effect (Opsional, ala Gemini)
        // Jika di antara 80px dan 180px, paksa ke 80px (biar rapi collapsed)
        if (newWidth > 80 && newWidth < 180) {
           // Opsional: biarkan smooth atau snap. Kita biarkan smooth dulu biar user bebas.
           // setSidebarWidth(80); 
           setSidebarWidth(newWidth);
        } else {
           setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  // === EVENT LISTENERS ===
  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // === MOBILE CHECK ===
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);


  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR (Width dikontrol State) */}
      <Sidebar 
        width={sidebarWidth} 
        isMobile={isMobile}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        startResizing={startResizing as any} // Cast type biar aman
      />

      {/* 2. MAIN CONTENT */}
      {/* Flex-1 memastikan dia mengisi sisa ruang secara otomatis */}
      <main 
        className="flex-1 flex flex-col min-w-0 relative overflow-hidden transition-all duration-75"
        style={{ cursor: isResizing ? 'col-resize' : 'default', userSelect: isResizing ? 'none' : 'auto' }}
      >
        
        {/* Tombol Hamburger (Mobile Only) */}
        {isMobile && (
          <div className="absolute top-4 left-4 z-30">
             <button 
               onClick={() => setIsOpenMobile(true)}
               className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white shadow-lg"
             >
               <Menu className="w-6 h-6" />
             </button>
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth z-10">
          {/* Max Width lebih besar untuk mengakomodasi layar lebar */}
          <div className="max-w-[2400px] mx-auto min-h-full">
            {children}
          </div>
        </div>

        {/* Overlay saat resizing agar iframe/chart tidak menangkap mouse event */}
        {isResizing && <div className="absolute inset-0 z-50 bg-transparent" />}
        
      </main>

    </div>
  );
}