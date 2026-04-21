/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

module.exports = nextConfig;
