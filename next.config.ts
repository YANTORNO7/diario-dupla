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
      {
        source: "/argentina/vellaneda-para-el-mundo-los-cracks-que-exportaron-racing-e-independiente",
        destination: "/argentina/avellaneda-para-el-mundo-los-cracks-que-exportaron-racing-e-independiente",
        permanent: true,
      },
      {
        source: "/la-dupla/instituto-gano-en-varela-y-es-puntero-solitario",
        destination: "/argentina/instituto-gano-en-varela-y-es-puntero-solitario",
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
