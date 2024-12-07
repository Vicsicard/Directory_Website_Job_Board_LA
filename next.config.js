const path = require('path');
const fs = require('fs');

// Validate paths before configuration
const srcPath = path.join(__dirname, 'src');
const appPath = path.join(srcPath, 'app');

// Log paths for debugging
console.log('Validating paths:');
console.log('- Source directory:', srcPath, '(exists:', fs.existsSync(srcPath), ')');
console.log('- App directory:', appPath, '(exists:', fs.existsSync(appPath), ')');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true
  },
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  webpack: (config) => {
    // Log webpack configuration
    console.log('Webpack config paths:');
    console.log('- __dirname:', __dirname);
    console.log('- srcPath:', srcPath);

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath
    };

    return config;
  }
}

module.exports = nextConfig