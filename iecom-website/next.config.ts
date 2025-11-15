import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      }
    ]
  }
};

export default nextConfig;
