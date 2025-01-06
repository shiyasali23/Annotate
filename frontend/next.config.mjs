/** @type {import('next').NextConfig} */
export default {
    // Enable all hosts and add needed headers for WebSocket
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
      ]
    },
    // Add WebSocket rewrite rule
    async rewrites() {
      return [
        {
          source: '/_next/webpack-hmr',
          destination: '/_next/webpack-hmr',
        },
      ]
    },
  }