const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    };
    return config;
  },
}

module.exports = nextConfig
