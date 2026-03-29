import ScreenerClient from "@/components/dashboard/ScreenerClient";

async function getScreenerData() {
  try {
    // Tambahkan timestamp dummy (?t=...) untuk menghancurkan cache Next.js
    const timestamp = new Date().getTime();
    const res = await fetch(`http://127.0.0.1:8000/api/stocks?t=${timestamp}`, { 
      cache: "no-store",
      next: { revalidate: 0 } // Perintah absolut untuk tidak caching
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Gagal menarik API:", error);
    return [];
  }
}

export default async function ScreenerPage() {
  const stocks = await getScreenerData();

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <ScreenerClient stocks={stocks} />
    </div>
  );
}