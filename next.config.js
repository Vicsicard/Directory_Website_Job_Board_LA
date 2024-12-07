/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 300,
  // Configure path handling
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
  },
  // Disable static optimization for dynamic routes
  experimental: {
    // Enable if needed for debugging
    // logging: { level: 'verbose' },
    // Enable reading files from data directory
    outputFileTracingIncludes: {
      '/**': ['./data/**/*']
    }
  },
  // Configure webpack to handle CSV files
  webpack(config) {
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
  }
}

module.exports = nextConfig
