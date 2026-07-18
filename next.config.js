/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Force HTTPS for 2 years
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent clickjacking — no one can embed adressa.cz in an iframe
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop browsers guessing file types (MIME sniffing attacks)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak full URL to third-party sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features that aren't needed (geolocation is allowed for Game Mode's location marker)
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()' },
  // Legacy XSS filter for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: '*.public.blob.vercel-storage.com' },
      { hostname: 'static.wixstatic.com' },
      { hostname: 'www.dentalcarecb.cz' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
