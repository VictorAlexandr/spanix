import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o dev server é aberto por 127.0.0.1, não por localhost
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
