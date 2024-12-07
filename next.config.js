const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    console.log('Build ID:', buildId);
    console.log('Development mode:', dev);
    console.log('Is Server:', isServer);
    console.log('Default loaders:', JSON.stringify(defaultLoaders, null, 2));
    console.log('Current directory:', __dirname);
    console.log('Process CWD:', process.cwd());

    try {
      console.log('Initial config.resolve:', JSON.stringify(config.resolve, null, 2));
      
      // Ensure config.resolve exists
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};

      // Add path alias
      const srcPath = path.join(__dirname, './src');
      console.log('Source path:', srcPath);
      console.log('Source path exists:', require('fs').existsSync(srcPath));

      config.resolve.alias['@'] = srcPath;
      console.log('Updated aliases:', JSON.stringify(config.resolve.alias, null, 2));

      // Add CSV handling
      console.log('Adding CSV loader...');
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      config.module.rules.push({
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      });

      console.log('Final webpack config structure:', {
        resolve: config.resolve,
        module: {
          rules: config.module.rules.length
        }
      });

      return config;
    } catch (error) {
      console.error('Error in webpack config:', error);
      throw error;
    }
  },
};

module.exports = nextConfig;
