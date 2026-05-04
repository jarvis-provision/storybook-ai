import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["charged-pat-calculations-pupils.trycloudflare.com"],
  experimental: {
    serverActions: { bodySizeLimit: "10mb" }
  }
};

export default nextConfig;
