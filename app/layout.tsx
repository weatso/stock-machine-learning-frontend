// File: frontend/app/layout.tsx
'use client'; // Ubah jadi Client Component agar bisa cek pathname

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation"; // Import hook untuk cek URL

const inter = Inter({ subsets: ["latin"] });

// Metadata tidak bisa diexport dari Client Component, jadi kita hapus dulu
// (Atau pindahkan ke layout server terpisah jika ingin SEO sempurna, tapi untuk skripsi ini oke)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Daftar halaman yang TIDAK boleh ada Sidebar
  const noSidebarRoutes = ['/login', '/register'];
  
  // Cek apakah halaman saat ini ada di daftar larangan
  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-900 text-white">
          
          {/* Tampilkan Sidebar HANYA jika showSidebar = true */}
          {showSidebar && <Sidebar />}

          {/* Jika ada Sidebar, kita butuh padding (p-8).
             Jika tidak (halaman Login), kita ingin layar penuh (p-0).
          */}
          <main className={`flex-1 ${showSidebar ? 'p-8' : 'p-0'}`}> 
            {children} 
          </main>

        </div>
      </body>
    </html>
  );
}