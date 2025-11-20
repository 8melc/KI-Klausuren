import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', 'node-poppler'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
