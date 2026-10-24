import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.diariodupla.com" }],
        destination: "https://diariodupla.com/:path*",
        permanent: true,
      },
      {
        source: "/automovilismo",
        destination: "/deporte-motor",
        permanent: true,
      },
      {
        source: "/automovilismo/:path*",
        destination: "/deporte-motor/:path*",
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
