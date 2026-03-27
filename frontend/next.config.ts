import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // VPS de producción: imágenes servidas por nginx
      {
        protocol: 'https',
        hostname: 'alexis.iwebtecnology.com',
        pathname: '/media/images/**',
      },
      // Dev local: FastAPI sirve las imágenes en localhost
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/images/**',
      },
    ],
  },
};

export default nextConfig;
