import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackBuildWorker: false
  },
  env: {
    AUTH_APPS_SCRIPT_URL: process.env.AUTH_APPS_SCRIPT_URL,
    SESSION_SECRET: process.env.SESSION_SECRET
  }
};

export default nextConfig;
