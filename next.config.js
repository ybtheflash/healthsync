/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Exclude medications directory from build
    unstable_excludeFiles: ['**/notes/**'],
    // Vercel-specific optimizations are automatically applied
    // You can add additional configuration below as needed
    images: {
      domains: [],
      // Enables image optimization features
      unoptimized: false,
    },
    // Uncomment if you need environment variables
    // env: {
    //   API_URL: process.env.API_URL,
    // },
  }
  
  module.exports = nextConfig;
  