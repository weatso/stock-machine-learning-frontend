"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  LayoutDashboard, 
  Bell, 
  ShieldAlert, 
  Database,
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const investorNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "ML Screener", href: "/dashboard/stocks", icon: Activity },
    { name: "Price Alerts", href: "/dashboard/alerts", icon: Bell },
  ];

  const adminNav = [
    { name: "Data Override", href: "/dashboard/admin/override", icon: Database },
    { name: "Model Health", href: "/dashboard/admin/model", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#050505] border-r border-white/5 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          WEATSO<span className="text-gray-500 font-light ml-1">Kuantitatif</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8">
        {/* Investor Section */}
        <div>
          <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Investor Area</p>
          <div className="space-y-1">
            {investorNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? "bg-white/10 text-white border border-white/10" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Section (Sesuai Janji di Use Case Proposal) */}
        <div>
          <p className="px-3 text-[10px] font-bold text-rose-900 uppercase tracking-widest mb-4">Administrator</p>
          <div className="space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "text-gray-600 hover:text-rose-400 hover:bg-rose-500/5"}`}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={async () => {
            const { createBrowserClient } = await import('@supabase/ssr');
            const supabase = createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            await supabase.auth.signOut();
            window.location.href = '/login'; // Memaksa peramban membuang memori sesi dan kembali ke gerbang utama
          }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 hover:text-rose-500 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}