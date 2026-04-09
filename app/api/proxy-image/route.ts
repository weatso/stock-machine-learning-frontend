import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Parameter URL gambar tidak ditemukan', { status: 400 });
  }

  try {
    // Menarik gambar dari Invezgo dengan menyamarkan identitas (Bypass Cloudflare 1011)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Menyamar sebagai browser sungguhan
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        // KUNCI UTAMA: Menipu Cloudflare agar mengira request ini berasal dari domain Invezgo sendiri
        'Referer': 'https://storage.invezgo.com/'
      },
    });

    if (!response.ok) {
      console.error(`Gagal mem-bypass gambar dari ${url}. Status Cloudflare: ${response.status}`);
      return new NextResponse('Gagal mengambil gambar dari server sumber', { status: response.status });
    }

    // Mengubah data gambar mentah menjadi buffer
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Mengembalikan buffer gambar ke frontend aplikasi Anda dengan caching agar tidak membebani server
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Proxy Image Error:', error);
    return new NextResponse('Terjadi kesalahan internal pada server backend', { status: 500 });
  }
}