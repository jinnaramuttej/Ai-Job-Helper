import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/Node-only parsers must stay outside the bundler.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
