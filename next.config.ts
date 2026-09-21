/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Images accepts any domains
      },
    ],
  },
};

export default nextConfig;
