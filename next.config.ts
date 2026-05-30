import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "sharp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
