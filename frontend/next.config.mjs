/** @type {import('next').NextConfig} */
import path from 'path';

export default {
  experimental: {
    turbo: {
      loaders: {}, // Enables Turbopack
    },
  },

  headers: async () => {
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

  async rewrites() {
    return [
      {
        source: '/_next/webpack-hmr',
        destination: '/_next/webpack-hmr',
      },
    ];
  },

  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};
