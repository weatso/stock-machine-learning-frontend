"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr'
import { Activity, Lock, Mail, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Inisiasi koneksi Supabase di sisi Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Jika berhasil, Middleware akan otomatis mengizinkan akses ke /dashboard
      router.push("/dashboard");
      router.refresh(); // Memaksa layout membaca status sesi terbaru
    } catch (err: any) {
      setError(err.message || "Gagal melakukan autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            WEATSO<span className="text-gray-500 font-light">Kuantitatif</span>
          </h1>
          <p className="text-sm text-gray-500 text-center">Sistem Pendukung Keputusan Berbasis Machine Learning</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-400 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="investor@domain.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Memverifikasi..." : "Akses Ruang Kontrol"}
          </button>
        </form>
      </div>
    </div>
  );
}