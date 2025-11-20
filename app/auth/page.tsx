// File: frontend/app/auth/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Import client yg tadi dibuat
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fungsi Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMessage('Login Gagal: ' + error.message);
    } else {
      setMessage('Login Berhasil! Mengalihkan...');
      router.push('/'); // Pindah ke dashboard
    }
    setLoading(false);
  };

  // Fungsi Register (Menambah User Baru)
  const handleRegister = async () => {
    setLoading(true);
    // 1. Daftar ke Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage('Register Gagal: ' + error.message);
    } else {
      // Trigger SQL di Langkah 1 akan otomatis mengisi tabel 'profiles'
      setMessage('Pendaftaran Berhasil! Silakan Login.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-center">Masuk / Daftar</h2>
        
        {message && (
          <div className={`p-3 rounded ${message.includes('Gagal') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Login (Masuk)'}
          </button>
        </form>

        <div className="text-center">
          <span className="text-gray-400 text-sm">Belum punya akun? </span>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="text-blue-400 hover:underline text-sm font-semibold"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}