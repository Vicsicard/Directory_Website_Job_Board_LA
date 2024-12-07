const path = require('path');
const fs = require('fs');

// Debug function to check if path exists
const validatePath = (pathToCheck) => {
  const exists = fs.existsSync(pathToCheck);
  console.log(`Checking path: ${pathToCheck} (exists: ${exists})`);
  return exists;
};

// Log all important paths
console.log('\nDebug Information:');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Node version:', process.version);

const srcPath = path.join(__dirname, 'src');
const appPath = path.join(srcPath, 'app');
const pagesPath = path.join(__dirname, 'pages');

console.log('\nPath Resolution:');
console.log('src path:', srcPath, '(exists:', validatePath(srcPath), ')');
console.log('app path:', appPath, '(exists:', validatePath(appPath), ')');
console.log('pages path:', pagesPath, '(exists:', validatePath(pagesPath), ')');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true
  },
  serverExternalPackages: ['mongodb'],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    console.log('\nWebpack Configuration:');
    console.log('Build ID:', buildId);
    console.log('Development mode:', dev);
    console.log('Is Server:', isServer);
    
    // Log resolved aliases before modification
    console.log('\nCurrent aliases:', config.resolve?.alias || {});
    
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath
    };
    
    // Log final resolved aliases
    console.log('Updated aliases:', config.resolve.alias);
    
    return config;
  }
}

module.exports = nextConfig