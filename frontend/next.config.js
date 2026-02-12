/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Explicitly disable Turbopack for now
  experimental: {
    turbo: false
  },
  
  // Disable Turbopack in favor of webpack
  webpack: (config, { isServer }) => {
    return config;
  },
  
  // Configure images
  images: {
    unoptimized: true,
  },
  
  // Disable Turbopack
  turbopack: undefined,
  
  // Optional: Add basePath if your app is not deployed at the root
  // basePath: '/your-base-path',
  
  // Optional: Environment variables
  env: {
    // Add any build-time environment variables here
  },
  
  // Configure the build output directory
  distDir: '.next',
  
  // Generate a unique build ID
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
}

module.exports = nextConfig