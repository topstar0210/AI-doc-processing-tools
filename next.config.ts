import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "tesseract.js", "@qdrant/js-client-rest"],
};

export default nextConfig;
