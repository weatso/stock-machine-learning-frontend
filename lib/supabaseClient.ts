// File: frontend/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_API_URL || ''; 
// Ups, kita butuh URL & KEY Supabase, bukan URL Backend Python.
// Kita perlu update environment variable nanti.

// SEMENTARA: Masukkan URL & Key Supabase Anda langsung di sini (Hardcode)
// Nanti kita rapikan ke .env.local agar lebih aman.
const SUPABASE_URL = "https://jjdbxaxkfkzjwkadseuj.supabase.co"; // Ganti dengan URL Supabase Anda
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZGJ4YXhrZmt6andrYWRzZXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExOTI2NjcsImV4cCI6MjA3Njc2ODY2N30.VtdkQvxlZlSMX8zEICJZ-7EmsS5AxD-r9OEaY1aLYjw"; // Ganti dengan ANON KEY Supabase Anda (Panjang)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);