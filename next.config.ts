import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH.trim() !== ''
  ? process.env.NEXT_PUBLIC_BASE_PATH.trim()
  : undefined;

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for GitHub Pages routing
  trailingSlash: true,
};

export default nextConfig;
