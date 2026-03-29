"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "ML Screener", href: "/dashboard/stocks", icon: Activity },
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#050505] border-r border-white/5 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          WEATSO<span className="text-gray-500 font-light ml-1">Kuantitatif</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}