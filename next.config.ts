import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from common image hosts used in the app
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Compress responses
  compress: true,
  // PoweredByHeader disabled for security
  poweredByHeader: false,
};

export default nextConfig;
