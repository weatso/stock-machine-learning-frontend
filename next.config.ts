import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.invezgo.com',
        port: '',
        pathname: '/**',
      },
      // Tambahkan juga storage jika ada saham yang menggunakan subdomain tersebut
      {
        protocol: 'https',
        hostname: 'storage.invezgo.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;