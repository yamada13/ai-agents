import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the frontend to call the Python backend during dev
  async rewrites() {
    return [
      {
        source: "/api/agents/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:9000"}/agents/:path*`,
      },
    ];
  },
};

export default nextConfig;
