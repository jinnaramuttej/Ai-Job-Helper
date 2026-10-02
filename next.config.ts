import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/Node-only parsers must stay outside the bundler.
  serverExternalPackages: ["pdf-parse", "mammoth"],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  } as any,
};

export default nextConfig;
