/** @type {import('next').NextConfig} */
const rawBackend = process.env.API_PROXY_TARGET || process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
// Legacy NEXT_PUBLIC_API_BASE_URL sometimes includes /api/v1. Avoid double prefixes.
const configuredBackend = /^https?:\/\//.test(rawBackend)
  ? rawBackend.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
  : 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  // Errors are build blockers, not hidden by Next.js.
  typescript: {ignoreBuildErrors: false},
  eslint: {ignoreDuringBuilds: false},
  images: {
    remotePatterns: [
      {protocol:'https',hostname:'res.cloudinary.com',pathname:'/**'},
      {protocol:'https',hostname:'placehold.co',pathname:'/**'},
      {protocol:'https',hostname:'randomuser.me',pathname:'/api/portraits/**'},
      {protocol:'https',hostname:'i.pravatar.cc',pathname:'/**'},
      {protocol:'https',hostname:'cdn.jsdelivr.net',pathname:'/**'}
    ],
    dangerouslyAllowSVG: false
  },
  async rewrites() {
    return [{source:'/api/:path*',destination:`${configuredBackend}/api/:path*`}];
  },
  // Legacy project uses SVG imports via the webpack loader.
  webpack(config) {
    config.module.rules.push({test:/\.svg$/,use:['@svgr/webpack']});
    return config;
  }
};
module.exports = nextConfig;
