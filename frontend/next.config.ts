import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM may work without strict same-origin policy in development
    // Base Account SDK (used by RainbowKit) requires COOP to NOT be 'same-origin'
    return Promise.resolve([
      {
        source: '/',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  }
};

export default nextConfig;
