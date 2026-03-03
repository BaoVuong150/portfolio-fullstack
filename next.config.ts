import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (your project)
      {
        protocol: "https",
        hostname: "lhrqbwqsdzxaqwqodpfg.supabase.co",
      },
      // Cloudinary CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Placeholder images (dev/testing)
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // Google user images / thumbnails
      {
        protocol: "https",
        hostname: "encrypted-tbn2.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      // Google Drive direct links (used as <img> fallback, not Next/Image)
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;

