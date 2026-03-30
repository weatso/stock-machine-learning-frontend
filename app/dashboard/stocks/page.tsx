import ScreenerClient from "@/components/dashboard/ScreenerClient";

async function getScreenerData() {
  // Timestamp untuk menghancurkan cache Next.js secara paksa
  const timestamp = new Date().getTime();
  
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/stocks?t=${timestamp}`, { 
      cache: "no-store",
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - Backend FastAPI menolak koneksi.`);
    }

    const json = await res.json();

    if (!json || !json.data) {
      throw new Error("Data JSON cacat: Backend tidak mengembalikan format yang benar.");
    }

    return json.data;

  } catch (error: any) {
    throw new Error(`Koneksi Terputus: ${error.message}`);
  }
}

export default async function ScreenerPage() {
  try {
    const stocks = await getScreenerData();

    return (
      <div className="min-h-screen bg-[#050505] p-6 md:p-8">
        <ScreenerClient stocks={stocks} />
      </div>
    );
  } catch (error: any) {
    // TAMPILAN DIAGNOSTIK JIKA SERVER MATI
    return (
      <div className="min-h-screen bg-[#050505] p-8 flex flex-col items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-lg text-center max-w-lg">
          <h1 className="text-xl font-bold text-rose-500 tracking-widest mb-2 uppercase">System Failure</h1>
          <p className="text-sm text-rose-400 font-mono mb-4">{error.message}</p>
          <p className="text-xs text-gray-500">
            Diagnosis: Pastikan terminal Uvicorn (FastAPI) Anda sedang berjalan tanpa error di port 8000.
          </p>
        </div>
      </div>
    );
  }
}