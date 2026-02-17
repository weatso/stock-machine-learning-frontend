'use client';

import StockChart from '@/components/StockChart';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, ArrowLeft, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

// Helper Format Uang
const formatIDR = (num: number) => {
    if (!num) return "-";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
    // Next.js 15: params harus di-unwrapp dengan use()
    const { ticker } = use(params);

    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/${ticker}`);
                if (!res.ok) throw new Error("Saham tidak ditemukan");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [ticker]);

    if (loading) return <div className="p-12 text-zinc-500 animate-pulse">Memuat data analisis...</div>;
    if (!data) return <div className="p-12 text-red-500">Data saham tidak ditemukan.</div>;

    const { profile, chart_data } = data;

    // LOGIKA VALUASI GRAHAM (Sederhana)
    // Rumus: V = EPS * (8.5 + 2g) --> Kita pakai simplified PER 15 sebagai batas wajar
    const eps = profile.eps_ttm || (profile.fundamental_per > 0 ? (chart_data[chart_data.length - 1]?.close / profile.fundamental_per) : 0);
    const grahamValue = eps * 15; // Asumsi konservatif pertumbuhan 0%
    const currentPrice = chart_data[chart_data.length - 1]?.close || 0;
    const marginOfSafety = ((grahamValue - currentPrice) / grahamValue) * 100;

    const isUndervalued = marginOfSafety > 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* HEADER NAV */}
            <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white pl-0">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Screener
            </Button>

            {/* TITLE & PRICE HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-white tracking-tight">{profile.ticker}</h1>
                        <span className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">{profile.sectors?.name}</span>
                    </div>
                    <p className="text-zinc-400 mt-1 text-lg">{profile.company_name}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-white">
                        {formatIDR(currentPrice)}
                    </div>
                    <div className={`text-sm font-medium flex items-center justify-end gap-1 ${isUndervalued ? 'text-green-400' : 'text-amber-400'}`}>
                        {isUndervalued ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isUndervalued ? 'Potensi Undervalued' : 'Harga Premium'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* KOLOM KIRI: CHART & SUMMARY (2/3 Lebar) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* CHART */}
                    <StockChart data={chart_data} ticker={profile.ticker} />

                    {/* COMPANY SUMMARY */}
                    <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
                        <h3 className="text-zinc-200 font-semibold mb-3">Tentang Perusahaan</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {profile.summary || "Deskripsi perusahaan belum tersedia. Data ini diambil secara otomatis dari Yahoo Finance melalui API backend."}
                        </p>
                    </div>
                </div>

                {/* KOLOM KANAN: VALUATION CARD (1/3 Lebar) */}
                <div className="space-y-6">

                    {/* KARTU "THE GRAHAM SCORE" */}
                    <div className={`p-6 rounded-xl border-2 ${isUndervalued ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                        <h3 className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Analisa Nilai Wajar
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-400">Harga Sekarang</span>
                                <span className="text-white font-mono">{formatIDR(currentPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-400">Nilai Wajar (Est.)</span>
                                <span className="text-white font-mono font-bold">{formatIDR(grahamValue)}</span>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-zinc-500">Margin of Safety</span>
                                    <span className={isUndervalued ? "text-green-400" : "text-red-400"}>
                                        {marginOfSafety.toFixed(1)}%
                                    </span>
                                </div>
                                {/* Progress Bar Visual */}
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${isUndervalued ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(Math.abs(marginOfSafety), 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {isUndervalued ? (
                                <div className="bg-green-500/20 text-green-300 p-3 rounded text-xs flex gap-2 items-start mt-4">
                                    <DollarSign className="w-4 h-4 shrink-0" />
                                    Saham ini diperdagangkan di bawah nilai estimasi wajarnya. Potensi beli menurut prinsip Graham.
                                </div>
                            ) : (
                                <div className="bg-amber-500/20 text-amber-300 p-3 rounded text-xs flex gap-2 items-start mt-4">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    Harga relatif mahal dibandingkan fundamental labanya. Waspada koreksi.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KEY METRICS GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="text-zinc-500 text-xs uppercase">Market Cap</div>
                            <div className="text-zinc-200 font-mono text-sm mt-1">{formatIDR(profile.market_cap)}</div>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="text-zinc-500 text-xs uppercase">P/E Ratio</div>
                            <div className={`font-mono text-sm mt-1 ${profile.fundamental_per < 15 ? 'text-green-400' : 'text-zinc-200'}`}>
                                {profile.fundamental_per?.toFixed(2)}x
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="text-zinc-500 text-xs uppercase">PBV Ratio</div>
                            <div className={`font-mono text-sm mt-1 ${profile.fundamental_pbv < 1.5 ? 'text-green-400' : 'text-zinc-200'}`}>
                                {profile.fundamental_pbv?.toFixed(2)}x
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                            <div className="text-zinc-500 text-xs uppercase">EPS (TTM)</div>
                            <div className="text-zinc-200 font-mono text-sm mt-1">{eps ? formatIDR(eps) : '-'}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
