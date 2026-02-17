// File: frontend/app/components/Sidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; // Import supabase

// Import Ikon
import { 
  MdOutlineDashboard, 
  MdOutlineManageSearch, 
  MdOutlineViewModule,
  MdAdminPanelSettings, // Ikon Admin
  MdLogout // Ikon Logout
} from 'react-icons/md';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: MdOutlineDashboard },
  { name: 'Stock Screener', href: '/screener', icon: MdOutlineManageSearch },
  { name: 'Sector Heatmap', href: '/heatmap', icon: MdOutlineViewModule },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk menyimpan role user
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek Role saat komponen dimuat
  useEffect(() => {
    const checkRole = async () => {
      // 1. Ambil user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Cek role dia di tabel profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        // 3. Jika role admin, set state true
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkRole();
  }, []);

  // Fungsi Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 flex flex-col p-6 shadow-lg border-r border-gray-700">
      
      <h2 className="text-2xl font-bold mb-10 text-white text-center">
        DSS Investasi
      </h2>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {/* Menu Standar (Semua User) */}
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-6 w-6" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}

          {/* Menu KHUSUS ADMIN (Hanya muncul jika isAdmin = true) */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Area
                </p>
              </div>
              <li>
                <Link 
                  href="/admin/editor" // Halaman yang akan kita buat nanti
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${pathname === '/admin/editor'
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-red-300 hover:bg-red-900/30 hover:text-white'
                    }
                  `}
                >
                  <MdAdminPanelSettings className="h-6 w-6" />
                  <span className="font-medium">Data Editor</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Tombol Logout */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
        >
          <MdLogout className="h-6 w-6" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>

    </aside>
  );
}