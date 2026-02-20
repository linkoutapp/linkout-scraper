import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', '127.0.0.1'],
    },
  },
};

export default nextConfig;
