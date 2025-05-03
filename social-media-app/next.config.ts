import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apbookuploads.blob.core.windows.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
