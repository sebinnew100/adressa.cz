/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.public.blob.vercel-storage.com' },
      { hostname: 'static.wixstatic.com' },
      { hostname: 'www.dentalcarecb.cz' },
    ],
  },
};

module.exports = nextConfig;
