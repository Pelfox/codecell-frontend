import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  enablePrerenderSourceMaps: false,
  productionBrowserSourceMaps: false,
  output: 'standalone',
  experimental: {
    serverSourceMaps: false,
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
