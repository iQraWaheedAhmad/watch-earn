import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      // Proxy only login and register requests to backend
      {
        source: '/login',
        destination: 'http://localhost:3001/login',
      },
      {
        source: '/register',
        destination: 'http://localhost:3001/register',
      },
    ];
  },

  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
