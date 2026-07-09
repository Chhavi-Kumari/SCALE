import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackBuildWorker: false
  },
  env: {
    AUTH_APPS_SCRIPT_URL: process.env.AUTH_APPS_SCRIPT_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ARTICLES_CSV_URL: process.env.ARTICLES_CSV_URL

  }
};
export default nextConfig;
