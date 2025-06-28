import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@node-rs/argon2"],
  reactStrictMode: true,
};

export default nextConfig;
