import React from "react";
import Sidebar from "@/components/dashboard/Sidebar"; // Pastikan path ini benar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* SIDEBAR:
        Sekarang komponen ini mandiri. Dia akan mengatur lebarnya sendiri 
        dan 'mendorong' konten di sebelahnya (karena kita pakai Flexbox).
      */}
      <Sidebar />

      {/* MAIN CONTENT:
        flex-1 artinya dia akan mengisi sisa ruang yang tersedia.
        overflow-y-auto agar bisa discroll jika konten panjang.
      */}
      <main className="flex-1 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
}