/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning instead of error
    ignoreDuringBuilds: true,
  },
  // Suppress hydration warnings caused by browser extensions
  onDemandEntries: {
    // Keep pages in memory for a longer time
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.iconscout.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add API routes proxy configuration with increased timeout
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Use environment variable for API base URL, fallback to localhost for local dev
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/:path*`,
      },
      // Fallback for missing images to prevent 404 errors
      {
        source: '/images/iremehub-logo.png',
        destination: '/images/iremehub-logo.svg',
      },
      {
        source: '/images/iremehub-logo-white.png',
        destination: '/images/iremehub-logo-white.svg',
      }
    ];
  },
  // Handle SVG files
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  // Increase API timeout limits
  experimental: {
    proxyTimeout: 60000, // 60 seconds timeout instead of default 30
  },
};

module.exports = nextConfig;
