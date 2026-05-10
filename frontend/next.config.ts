import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Agent requests go through app/api/agents/[...path]/route.ts (server-side proxy).
  // That route adds the X-Site-Token header and forwards to the private Railway URL.
  // No rewrites needed — the API route handles /api/agents/* directly.
};

export default nextConfig;
