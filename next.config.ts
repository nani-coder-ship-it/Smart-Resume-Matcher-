import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore - 'eslint' may not exist in the NextConfig type of this version
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
