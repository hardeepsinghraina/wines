import type { NextConfig } from "next";
import path from 'path';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        port: '',
        pathname: '/wine-images/**',
      }
    ],
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (only in development)
  webpack: (config: Configuration) => {
    // Add alias for shared directory
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../shared'),
    };

    if (process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'development') {
      // Dynamic import for webpack-bundle-analyzer to avoid bundling it in production
      import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
        config.plugins = config.plugins || [];
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: false,
          })
        );
      }).catch(() => {
        // Silently fail if webpack-bundle-analyzer is not available
      });
    }
    return config;
  },
  
  // Redirects for category URLs
  async redirects() {
    const categories = [
      'bordeaux', 'burgundy', 'champagne', 'rhone', 'loire', 'alsace', 
      'languedoc', 'provence', 'tuscany', 'piedmont', 'veneto', 'rioja', 
      'ribera-del-duero', 'napa-valley', 'sonoma', 'oregon', 'washington', 
      'australia', 'new-zealand', 'chile', 'argentina', 'south-africa'
    ];

    return categories.map(category => ({
      source: `/products/${category}`,
      destination: `/categories/${category}`,
      permanent: true,
    }));
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
