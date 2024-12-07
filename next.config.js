const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['csv-parse']
  },
  // Explicitly set the distDir
  distDir: '.next',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Configure path handling
  webpack: (config, { isServer }) => {
    // Add path aliases
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    config.resolve.alias['@components'] = path.join(__dirname, 'src/components');
    config.resolve.alias['@utils'] = path.join(__dirname, 'src/utils');
    config.resolve.alias['@data'] = path.join(__dirname, 'src/data');

    // Configure CSV handling
    config.module.rules.push({
      test: /\.csv$/,
      use: [
        {
          loader: 'csv-loader',
          options: {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true
          }
        }
      ]
    });

    return config;
  },
  // Explicitly handle rewrites
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots'
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      }
    ]
  }
}

module.exports = nextConfig
