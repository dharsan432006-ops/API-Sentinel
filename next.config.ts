import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Webpack instead of Turbopack for Windows compatibility
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;