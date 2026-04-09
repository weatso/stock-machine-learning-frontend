"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import { Activity, Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";

export default function RootAuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        // Mode Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Mode Register
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Jika Anda ingin user langsung bisa masuk tanpa verifikasi email
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) throw error;
        
        // Catatan: Jika Supabase Anda di-set untuk mewajibkan konfirmasi email,
        // pesan ini akan muncul. Jika tidak, user otomatis login.
        alert("Registrasi berhasil. Jika sistem memerlukan verifikasi, silakan cek email Anda.");
      }

      router.push("/dashboard");
      router.refresh(); 
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat otentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl z-10 relative">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Activity className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
            WEATSO<span className="text-gray-500 font-light">Kuantitatif</span>
          </h1>
          <p className="text-sm text-gray-500 text-center font-medium">Sistem Cerdas Analisis Ekuitas & Valuasi</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-400 leading-relaxed font-medium">{error}</p>
          </div>
        )}

        {/* Tab Toggle Login/Register */}
        <div className="flex p-1 bg-[#111] border border-white/5 rounded-lg mb-8">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold transition-all rounded-md ${
              isLoginMode ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Masuk Akses
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold transition-all rounded-md ${
              !isLoginMode ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kredensial Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-700"
                placeholder="analis@domain.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kunci Keamanan</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={3}
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-700"
                placeholder="Minimal 3 karakter"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !email || !password}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            {loading ? (
              "MEMPROSES..."
            ) : isLoginMode ? (
              <>INISIASI SISTEM <ArrowRight className="w-4 h-4" /></>
            ) : (
              "BUKA AKSES BARU"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}