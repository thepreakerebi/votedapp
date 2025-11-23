import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Ignore problematic files from thread-stream and pino packages
    // This prevents webpack from trying to process test files, benchmarks, etc.
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules[\\/](thread-stream|pino|@reown[\\/]appkit)[\\/].*\.(test|spec|benchmark|example|zip|sh|yaml|yml|md|txt|LICENSE)$/i,
      type: "javascript/auto",
      use: [],
    });
    
    // Ignore dev dependencies that shouldn't be bundled
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "desm": false,
      "fastbench": false,
      "pino-elasticsearch": false,
      "tap": false,
      "why-is-node-running": false,
    };
    
    return config;
  },
  // Mark problematic packages as external (server-only)
  // This works for both webpack and Turbopack in Next.js 16
  serverExternalPackages: [
    "pino-pretty",
    "lokijs",
    "encoding",
    "thread-stream",
    "pino",
    "desm",
    "fastbench",
    "pino-elasticsearch",
    "tap",
    "why-is-node-running",
  ],
};

export default nextConfig;
