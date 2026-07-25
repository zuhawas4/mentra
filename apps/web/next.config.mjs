import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mentra/shared", "@mentra/brand"],
  turbopack: {
    // npm workspaces hoist `next` to the monorepo root
    root: path.join(__dirname, "../.."),
  },
  async redirects() {
    return [
      {
        source: "/sessions/:id/room",
        destination: "/room/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
