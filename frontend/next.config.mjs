/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    
  // Remove turbo experimental flag for production
  experimental: {
    turbo: {
      loaders: {}, // Enables Turbopack
    },
  },

  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  
  // CORS headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' }
        ],
      },
    ];
  },

  // Rewrites (keep only what's necessary for production)
  async rewrites() {
    return [
      // Typically webpack-hmr is only needed in development
      // but keeping it if your setup requires it in production
      {
        source: '/_next/webpack-hmr',
        destination: '/_next/webpack-hmr',
      },
    ];
  },

  // Path aliases
  webpack(config) {
    config.resolve.alias['@'] = join(__dirname, 'src');
    return config;
  },
};