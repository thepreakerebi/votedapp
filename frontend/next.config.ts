import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Add empty turbopack config to silence warning
  // Webpack config is required for Reown AppKit SSR compatibility
  turbopack: {},
};

export default nextConfig;
